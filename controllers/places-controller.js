const {v4: uuid} = require('uuid');
const {validationResult} = require('express-validator');

const HttpError = require('../models/http-error');
let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Odaiba',
        description: 'The beauty of Tokyo!!',
        imageUrl: 'https://rimage.gnst.jp/livejapan.com/public/article/detail/a/00/00/a0000002/img/basic/a0000002_main.jpg?20220629143600',
        address: '〒105-0000 東京都港区',
        location: {
            lat: '35.6365636',
            lng: '139.7401022'
        },
        creator: 'u1'
    },
    {
        id: 'p2',
        title: 'Sky Tree',
        description: 'Tallest in Tokyo!!',
        imageUrl: 'https://th.bing.com/th/id/OIP.WWnrt31KB7QGErB9jRF60AHaE7?w=186&h=124&c=7&r=0&o=5&dpr=1.7&pid=1.7',
        address: '〒131-0045 東京都墨田区押上丁目',
        location: {
            lat: '35.7100627',
            lng: '139.8061943'
        },
        creator: 'u1'
    }
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if(!place) {
        throw new HttpError('Could not find a place for the provided id.', 404);
     }

    res.json({place: place});
};


const getPlacesByuserId = (req, res, next) => {
    const userId = req.params.uid;
    const places = DUMMY_PLACES.filter( u => {
        return u.creator === userId;
    });
    if(!places || places.length === 0) {
        return next(
            new HttpError('Could not find a places for the provided user id.', 404)
        );
     }

    res.json({places});
};

const createPlace = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passes, please check your data', 422);
    }
    const { title, description, coordinates, address, creator } = req.body;

    const createdPlace = {
        id: uuid(),
        title,
        description,
        location: coordinates,
        address,
        creator
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({place: createdPlace});
};

const updatePlace = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passes, please check your data', 422);
    }
    const placeId = req.params.pid;
    const {title, description } = req.body;
    const updatedPlace ={ ...DUMMY_PLACES.find(p => p.id === placeId)};
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMY_PLACES[placeIndex] = updatedPlace;
    return res.status(200).json({place: updatedPlace});
};

const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place for that id.', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
    res.status(200).json({message: 'Deleted place.'});
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByuserId = getPlacesByuserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
