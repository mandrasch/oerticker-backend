'use strict';

const { sanitizeEntity } = require('strapi-utils')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  // Create link with linked user (apply / reference the user by default)
  async create(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.links.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.links.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.links });
  },

  // Update links only allowed for creators (user)
  async update(ctx) {
    const { id } = ctx.params;

    let entity;

    const [links] = await strapi.services.links.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    });

    if (!links) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.links.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.links.update({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.links });
  },

  // Delete links only allowed for creators (user)
  async delete(ctx) {
    const { id } = ctx.params;

    let entity;

    const [links] = await strapi.services.links.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    });

    if (!links) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.links.update({ id }, data, {
        files,
      });
    } else {
      entity = await strapi.services.links.delete({ id }, ctx.request.body);
    }

    return sanitizeEntity(entity, { model: strapi.models.links });
  },

  // Get logged in users links
  async me(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [{ messages: [{ id: 'No userization header was found' }] }]);
    }

    const data = await strapi.services.links.find({
      user: user.id
    });

    if (!data) {
      return ctx.notFound();
    }

    return sanitizeEntity(data, { model: strapi.models.links });

  },


};
