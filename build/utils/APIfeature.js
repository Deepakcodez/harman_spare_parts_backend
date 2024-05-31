"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIfeature = void 0;
class APIfeature {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        const keyword = this.queryStr.keyword
            ? {
                name: {
                    $regex: this.queryStr.keyword,
                    $options: 'i',
                },
            }
            : {};
        this.query = this.query.find(Object.assign({}, keyword));
        return this;
    }
    filter() {
        const queryCopy = Object.assign({}, this.queryStr);
        // Removing some keywords for category
        const removeKeys = ["keyword", "page", "limit"];
        removeKeys.forEach((key) => delete queryCopy[key]);
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    pagination(resultperPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultperPage * (currentPage - 1);
        this.query = this.query.limit(resultperPage).skip(skip);
        return this;
    }
}
exports.APIfeature = APIfeature;
