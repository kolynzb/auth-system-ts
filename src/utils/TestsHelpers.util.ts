import mongoose from "mongoose";

import { MongoMemoryServer } from "mongodb-memory-server";
import connectDB from "../config/DB.config";

export default class TestHelpers {
  static mongod: MongoMemoryServer;

  static async connectDb(): Promise<void> {
    this.mongod = await MongoMemoryServer.create();

    const uri = this.mongod.getUri();
    await connectDB(uri);
  }

  static async closeDb(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongod.stop();
  }

  static async clearDb(): Promise<void> {
    const { collections } = mongoose.connection;

    Object.values(collections).forEach((collection) =>
      collection.deleteMany({})
    );
  }
}

// INFO: TO USE TEST MONGO DB URI AS TEST DATABASE
// import config from 'config';
// export default class TestHelpers {
//   static uri: string = config.get('dbUri') as string;

//   static async connectDb(): Promise<void> {
//     console.log(this.uri);
//     await connectDB(this.uri);
//   }

//   static async closeDb(): Promise<void> {
//     await mongoose.connection.dropDatabase();
//     await mongoose.connection.close();
//   }

//   static async clearDb(): Promise<void> {
//     const { collections } = mongoose.connection;

//     Object.values(collections).forEach(collection => collection.deleteMany({}));
//   }

//   //   static startApp() {}
// }
