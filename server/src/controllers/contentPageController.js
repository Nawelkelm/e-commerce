const { validationResult } = require('express-validator');
const { ContentPage } = require('../models');
const logger = require('../config/logger');

/**
 * Listado publico: solo paginas publicadas y con los campos justos para
 * armar menues o indices.
 */
const getPublishedPages = async (req, res, next) => {
  try {
    const pages = await ContentPage.findAll({
      where: { isPublished: true },
      attributes: ['slug', 'title', 'excerpt', 'sortOrder'],
      order: [['sortOrder', 'ASC'], ['title', 'ASC']]
    });

    res.json(pages);
  } catch (error) {
    next(error);
  }
};

/**
 * Detalle publico por slug. Una pagina despublicada responde 404 para no
 * revelar que existe.
 */
const getPageBySlug = async (req, res, next) => {
  try {
    const page = await ContentPage.findOne({
      where: { slug: req.params.slug, isPublished: true },
      attributes: ['slug', 'title', 'content', 'excerpt', 'metaTitle', 'metaDescription', 'updatedAt']
    });

    if (!page) {
      return res.status(404).json({ message: 'Pagina no encontrada' });
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
};

// --- Administracion -------------------------------------------------------

const getAllPages = async (req, res, next) => {
  try {
    const pages = await ContentPage.findAll({
      order: [['sortOrder', 'ASC'], ['title', 'ASC']]
    });

    res.json(pages);
  } catch (error) {
    next(error);
  }
};

const getPageById = async (req, res, next) => {
  try {
    const page = await ContentPage.findByPk(req.params.id);

    if (!page) {
      return res.status(404).json({ message: 'Pagina no encontrada' });
    }

    res.json(page);
  } catch (error) {
    next(error);
  }
};

const createPage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { slug } = req.body;
    const existing = await ContentPage.findOne({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: `Ya existe una pagina con el slug "${slug}"` });
    }

    // isSystem lo define la plataforma en el seed, nunca el request.
    const page = await ContentPage.create({ ...req.body, isSystem: false });

    logger.info(`Content page created: ${page.slug}`);
    res.status(201).json(page);
  } catch (error) {
    next(error);
  }
};

const updatePage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = await ContentPage.findByPk(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Pagina no encontrada' });
    }

    // El slug de una pagina del sistema no se cambia: el footer y las
    // pantallas del checkout enlazan a esas URLs.
    if (page.isSystem && req.body.slug && req.body.slug !== page.slug) {
      return res.status(400).json({
        message: 'No se puede cambiar el slug de una pagina del sistema'
      });
    }

    if (req.body.slug && req.body.slug !== page.slug) {
      const existing = await ContentPage.findOne({ where: { slug: req.body.slug } });
      if (existing) {
        return res.status(409).json({ message: `Ya existe una pagina con el slug "${req.body.slug}"` });
      }
    }

    const { isSystem, ...updatable } = req.body;
    await page.update(updatable);

    logger.info(`Content page updated: ${page.slug}`);
    res.json(page);
  } catch (error) {
    next(error);
  }
};

const deletePage = async (req, res, next) => {
  try {
    const page = await ContentPage.findByPk(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Pagina no encontrada' });
    }

    if (page.isSystem) {
      return res.status(400).json({
        message: 'Esta pagina es parte de la plataforma y no se puede eliminar. Si no la queres mostrar, despublicala.'
      });
    }

    await page.destroy();

    logger.info(`Content page deleted: ${page.slug}`);
    res.json({ message: 'Pagina eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublishedPages,
  getPageBySlug,
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage
};
