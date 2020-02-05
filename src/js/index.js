import Search from "./models/Search";
import { elements, renderLoader, clearLoader } from "./views/base";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import Recipe from "./models/Recipe";
import List from "./models/List";

/** Global state of the app
 * - Search Object
 * - Current Recipe object
 * - shopping list object
 * - liked recipes
 */

const state = {};
window.state = state;

/**
 * Search Controller
 */

const controlSearch = async () => {
  // 1) Get query from view

  const query = searchView.getInput();

  if (query) {
    // 2) New Search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for result
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      // 4) Searh for recipes
      await state.search.getResult();

      // 5) Render result on UI
      clearLoader();
      searchView.renderResults(state.search.result);
      console.log(state.search.result);
    } catch (error) {
      alert("Something wrong with the search...");
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener("submit", e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener("click", e => {
  const btn = e.target.closest(".btn-inline");
  if (btn) {
    const gotoPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, gotoPage);
  }
});

/**
 *Recipe Controller
 */

const controlRecipe = async () => {
  // Get Id from url
  const id = window.location.hash.replace("#", "");
  console.log(id);

  if (id) {
    // Prepare UI for results
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight the selected Link
    if (state.search) searchView.highlightSelected(id);

    // Create new Recipe object
    state.recipe = new Recipe(id);

    try {
      // Get the recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert("Error processing recipe");
    }
  }
};

/*
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe); 
*/
// alternative of the above code

["hashchange", "load"].forEach(event =>
  window.addEventListener(event, controlRecipe)
);

/**
 *List Controller
 */
const controlList = () => {
  // Create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // Add Eeach ingredient to the list and UI
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

elements.shopping.addEventListener("click", e => {
  const id = e.target.closest(".shopping__item").dataset.itemId;
  //handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    state.list.deleteItem(id);
    listView.deleteItem(id);
  }
});

// handling recipe button clicks
elements.recipe.addEventListener("click", e => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn-add, .recipe__btn-add *")) {
    controlList();
  }
});

console.log(state);
