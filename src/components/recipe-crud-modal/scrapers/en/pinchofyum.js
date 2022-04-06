import request from 'request';
import { load } from 'cheerio';

import RecipeSchema from '../../helpers/recipe-schema';

const pinchOfYum = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes('pinchofyum.com/')) {
      reject(new Error("url provided must include 'pinchofyum.com/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = load(html);

          Recipe.image = $("meta[property='og:image']").attr('content');
          Recipe.name = $("meta[property='og:title']")
            .attr('content')
            .replace(' - Pinch of Yum', '');

          $('.tasty-recipes-ingredients')
            .find('li')
            .each((i, el) => {
              Recipe.ingredients.push($(el).text());
            });

          $('.tasty-recipes-instructions')
            .find('li')
            .each((i, el) => {
              Recipe.instructions.push($(el).text());
            });

          const tags = new Set();
          $("meta[property='slick:category']").each((i, el) => {
            // const tag = $(el)
            //   .attr("content")
            //   .split(";")
            //   .forEach(str => tags.add(str.split(":")[1]));
          });
          Recipe.tags = [...tags];

          Recipe.time.prep = $('.tasty-recipes-prep-time').text();
          Recipe.time.cook = $('.tasty-recipes-cook-time').text();
          Recipe.time.total = $('.tasty-recipes-total-time').text();

          $('.tasty-recipes-yield-scale').remove();
          Recipe.servings = $('.tasty-recipes-yield')
            .text()
            .replace(' - ', '-')
            .replace(/[-].*/, '')
            .replace(/\D+/g, '')
            .trim();

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

export default pinchOfYum;
