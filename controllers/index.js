const axios = require('axios');

const URL = process.env.API_URL;
axios.defaults.headers.origin = process.env.ORIGIN;

const request = async (req, api) => {
    try {
        if (!req.session.jwt) {
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET,
            });
    
            req.session.jwt = tokenResult.data.token;
        }

        return axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt },
        });
    } catch (err) {
        // 처리할 수 있는 에러
        console.log(err.response?.status);
        if (err.response?.status === 419) {
            delete req.session.jwt;
            return request(req, api);
        }
        // 처리할 수 없는 에러...
        // TODO 처음 보는 문법
        throw err.response;
    }
};

exports.getMyPosts = async (req, res, next) => {
    try {
        const result = await request(req, '/post/my');
        res.json(result.data);
    } catch (err) {
        console.error(err);
        next(err);
    }
};

exports.searchByHashtag = async (req, res, next) => {
    try {
        const result = await request(req, `/post/hashtag/${encodeURIComponent(req.params.hashtag)}`);
        res.json(result.data);
    } catch (err) {
        console.error(err);
        next(err);
    }
};