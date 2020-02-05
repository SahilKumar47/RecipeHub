import axios from "axios";
import { key, appId } from "../config";
export default class Search {
  constructor(query) {
    this.query = query;
  }

  async getResult() {
    try {
      const res = await axios(
        `https://forkify-api.herokuapp.com/api/search?&q=${this.query}`
      );

      //   const res = await axios(
      //     `https://api.edamam.com/search?q=${this.query}&app_id=${appId}&app_key=${key}`
      //   );
      this.result = res.data.recipes;
    } catch (error) {
      alert(error);
    }
  }
}
