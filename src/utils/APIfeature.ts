import { Document, Query } from 'mongoose';
import { json } from 'stream/consumers';

interface QueryString {
  keyword?: string;
  page?: string;
  limit?: string;
  [key: string]: any;  // Allow for additional arbitrary keys
}


export class APIfeature<T extends Document> {
  query: Query<T[], T>;
  queryStr: QueryString;

  constructor(query: Query<T[], T>, queryStr: QueryString) {
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

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy: QueryString = { ...this.queryStr };

    // Removing some keywords for category
    const removeKeys = ["keyword", "page", "limit"];
    removeKeys.forEach((key) => delete queryCopy[key]);
    
    let queryStr = JSON.stringify(queryCopy)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=> `$${key}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }


  pagination(resultperPage:number){
    const currentPage:number= Number(this.queryStr.page) || 1;

    const skip = resultperPage * (currentPage - 1 );

    this.query = this.query.limit(resultperPage).skip(skip);

    return this
  }
}
