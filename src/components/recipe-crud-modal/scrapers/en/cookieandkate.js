import request from 'request';
import { load } from 'cheerio';

import RecipeSchema from '../../helpers/recipe-schema';

const cookieAndKate = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes('cookieandkate.com/')) {
      reject(new Error("url provided must include 'cookieandkate.com/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = load(html);

          Recipe.image = $("meta[property='og:image']").attr('content');
          Recipe.name = $('.tasty-recipes').children('h2').text();

          $('.tasty-recipe-ingredients')
            .find('h4, li')
            .each((i, el) => {
              Recipe.ingredients.push($(el).text());
            });

          $('.tasty-recipe-instructions')
            .find('li')
            .each((i, el) => {
              Recipe.instructions.push($(el).text());
            });

          $("a[rel='category tag']").each((i, el) => {
            Recipe.tags.push($(el).text());
          });

          Recipe.time.prep = $('.tasty-recipes-prep-time').text();
          Recipe.time.cook = $('.tasty-recipes-cook-time').text();
          Recipe.time.total = $('.tasty-recipes-total-time').text();

          $('.tasty-recipes-yield-scale').remove();
          Recipe.servings = $('.tasty-recipes-yield span').text().trim();

          if (
            !Recipe.name ||
            !Recipe.ingredients.length ||
            !Recipe.instructions.length
          ) {
            reject(new Error('No recipe found on page'));
          } else {
            resolve(Recipe);
          }
        } else {
          reject(new Error('No recipe found on page'));
        }
      });
    }
  });
};

export default cookieAndKate;
