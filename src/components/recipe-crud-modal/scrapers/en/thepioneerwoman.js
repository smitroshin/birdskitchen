import request from 'request';
import { load } from 'cheerio';

import RecipeSchema from '../../helpers/recipe-schema';

const thePioneerWoman = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes('thepioneerwoman.com/food-cooking/')) {
      reject(
        new Error(
          "url provided must include 'thepioneerwoman.com/food-cooking/'"
        )
      );
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = load(html);

          Recipe.image = $("meta[property='og:image']")
            .attr('content')
            .replace(/[.]jpg.*/, '.jpg');

          Recipe.name = $('.recipe-hed').first().text();

          $('.ingredient-item').each((i, el) => {
            Recipe.ingredients.push($(el).text().replace(/\s\s+/g, ' ').trim());
          });

          $('.direction-lists')
            .find('li')
            .each((i, el) => {
              if (el.type === 'text') {
                Recipe.instructions.push($(el).text().trim());
              }
            });
          if (!Recipe.instructions.length) {
            $('.direction-lists').each((i, el) => {
              $(el)
                .find('li')
                .each((i, elChild) => {
                  Recipe.instructions.push($(elChild).text().trim());
                });
            });

            $('.direction-lists')
              .contents()
              .each((i, el) => {
                if (el.type === 'text') {
                  Recipe.instructions.push($(el).text().trim());
                }
              });
          }

          Recipe.time.prep = $('.prep-time-amount')
            .text()
            .replace(/\s\s+/g, ' ')
            .trim();
          Recipe.time.cook = $('.cook-time-amount')
            .text()
            .replace(/\s\s+/g, ' ')
            .trim();
          Recipe.time.total = $('.total-time-amount')
            .text()
            .replace(/\s\s+/g, ' ')
            .trim();
          Recipe.servings = $('.yields-amount')
            .text()
            .replace('servings', '')
            .split(' ')[0]
            .split('-')[0]
            .trim();

          $('.seo-tag-list').each((i, el) => {
            $(el)
              .find('li')
              .each((i, elChild) => {
                Recipe.tags.push($(elChild).text().trim());
              });
          });

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

export default thePioneerWoman;
