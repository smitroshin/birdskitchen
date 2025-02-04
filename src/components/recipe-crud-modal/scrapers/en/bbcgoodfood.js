import request from 'request';
import { load } from 'cheerio';

import RecipeSchema from '../../helpers/recipe-schema';

const bbcGoodFood = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes('bbcgoodfood.com/recipes/')) {
      reject(new Error("url provided must include 'bbcgoodfood.com/recipes/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = load(html);

          Recipe.image = $("meta[name='og:image']").attr('content');
          Recipe.name = $("meta[name='og:title']").attr('content');

          $('.recipe-template__ingredients')
            .find('.list-item')
            .each((i, el) => {
              Recipe.ingredients.push($(el).text().replace(' ,', ',').trim());
            });

          $('.recipe__ingredients')
            .find('.list-item')
            .each((i, el) => {
              Recipe.ingredients.push($(el).text().replace(' ,', ',').trim());
            });

          $('.recipe-template__method-steps')
            .find('.list-item')
            .children('div')
            .each((i, el) => {
              Recipe.instructions.push($(el).text());
            });

          $('.recipe__method-steps')
            .find('.list-item')
            .children('div')
            .each((i, el) => {
              Recipe.instructions.push($(el).text());
            });

          $('.cook-and-prep-time')
            .find('.list-item')
            .each((i, el) => {
              const text = $(el).text();
              if (text.includes('Prep')) {
                Recipe.time.prep = $(el).find('time').text();
              } else if (text.includes('Cook')) {
                Recipe.time.cook = $(el).find('time').text();
              }
            });

          Recipe.servings = $('.masthead__servings')
            .text()
            .replace('Makes ', '')
            .replace('Serves ', '')
            .replace(' - ', '-')
            .replace(/[-].*/, '');

          $('.icon-stacks').remove();
          Recipe.servings = $('.header__servings')
            .text()
            .replace('Makes ', '')
            .replace('Serves ', '')
            .replace(' - ', '-')
            .replace(/[-].*/, '');

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

export default bbcGoodFood;
