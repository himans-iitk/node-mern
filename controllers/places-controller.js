const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById =async (req, res, next) => {
    const placeId = req.params.pid;
    let placee;
    try{
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }

    if(!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404
        );
        return next(error);
     }

    res.json({place: place.toObject( {getters: true} )});
};


const getPlacesByuserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userwithPlaces;
    try{
        userwithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again later.', 500
        );
        return next(error);
    }


    if(!userwithPlaces || userwithPlaces.places.length === 0) {
        return next(
            new HttpError('Could not find a places for the provided user id.', 404)
        );
     }

    res.json({ places: userwithPlaces.places.map(place => place.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
       const error = new HttpError('Invalid inputs passes, please check your data', 422);
       return next(error);
    }
    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://rimage.gnst.jp/livejapan.com/public/article/detail/a/00/00/a0000002/img/basic/a0000002_main.jpg?20220629143600',
        creator
    });

    let user;
    try {
        user = await User.findById(creator);

    }catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again',
            500
        );
        return next(error);
    }

    if(!user) {
        const error = new HttpError('Could not find user for provided Id', 404);
        return next(error);
    }
    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({place: createdPlace});
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error = new HttpError('Invalid inputs passes, please check your data', 422);
        return next(error);
    }
    const placeId = req.params.pid;
    const {title, description } = req.body;

    let place;
    try{
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place', 500
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err){
        const error = new HttpError(
            'Something went wrong, could not update place', 500
        );
        return next(error);
    };


    return res.status(200).json({place: place.toObject({ getters: true}) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place', 500
        );
        return next(error);
    }

    if(!place) {
        const error = new HttpError(' COuld not find place for this id.', 404);
        return next(error);
    }

    try {
        //await Place.deleteOne({ _id: placeId });
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await Place.deleteOne({ _id: placeId }).session(sess);
        await sess.commitTransaction();
    } catch (err){
        console.log(err);
        const error = new HttpError(
            'Something went wrong, could not delete place', 500
        );
        return next(error);
    };

    res.status(200).json({message: 'Deleted place.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByuserId = getPlacesByuserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
