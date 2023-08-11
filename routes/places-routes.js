const express = require('express');
const bodyParser = require('body-parser')

const HttpError = require('../models/http-error');

const router = express.Router();

const DUMMY_PLACES = [
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
        creator: 'u2'
    }
];

router.get('/:pid', (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => {
        return p.id === placeId;
    });

    if(!place) {
        throw new HttpError('Could not find a place for the provided id.', 404);
     }

    res.json({place: place});
});


router.get('/user/:uid', (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find( u => {
        return u.creator === userId;
    });
    if(!place) {
        const error = new Error('Could not find a place for the provided user id.');
        error.code = 404;
        return next(
            new HttpError('Could not find a place for the provided user id.', 404)
        );
     }

    res.json({place});
});


module.exports = router;