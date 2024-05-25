import { Document, Model, Query } from 'mongoose';

interface QueryString {
  keyword?: string;
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
}

