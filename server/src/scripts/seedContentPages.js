const { ContentPage } = require('../models');
const logger = require('../config/logger');

/**
 * Paginas institucionales y legales que trae la plataforma.
 *
 * Los slugs coinciden con los que el footer ya enlazaba por defecto, que
 * hasta ahora caian en una pantalla en blanco.
 *
 * El contenido es un punto de partida redactado para el mercado argentino.
 * Los tramos entre corchetes los tiene que completar cada tienda desde
 * Admin > Paginas: no se pueden inventar porque son datos fiscales reales.
 */
const DEFAULT_PAGES = [
  {
    slug: 'terminos',
    title: 'Términos y Condiciones',
    sortOrder: 10,
    excerpt: 'Condiciones de uso del sitio y de compra.',
    content: `
<h2>1. Identificación del vendedor</h2>
<p>Este sitio es operado por <strong>[RAZÓN SOCIAL]</strong>, CUIT <strong>[CUIT]</strong>,
con domicilio en <strong>[DOMICILIO COMERCIAL]</strong>.</p>

<h2>2. Aceptación</h2>
<p>Al navegar y comprar en este sitio aceptás estos Términos y Condiciones. Si no estás
de acuerdo, te pedimos que no utilices el sitio.</p>

<h2>3. Productos y precios</h2>
<p>Los precios se expresan en pesos argentinos e incluyen IVA salvo que se indique lo
contrario. Las imágenes son ilustrativas. Nos reservamos el derecho de modificar precios
y disponibilidad sin aviso previo; el precio válido es el vigente al momento de confirmar
el pedido.</p>

<h2>4. Proceso de compra</h2>
<p>Una vez confirmado el pedido vas a recibir un correo con el detalle. La compra queda
perfeccionada cuando se acredita el pago. Si un producto no tuviera stock, te vamos a
contactar para ofrecerte un reemplazo o la devolución del importe.</p>

<h2>5. Medios de pago</h2>
<p>Aceptamos los medios de pago que se muestran en el checkout. Las operaciones con
tarjeta se procesan a través de la plataforma de pagos correspondiente; no almacenamos
datos de tarjetas en nuestros servidores.</p>

<h2>6. Envíos</h2>
<p>Los plazos y costos de envío se informan en el checkout antes de confirmar la compra.
Ver más detalle en la página de <a href="/envios">Envíos</a>.</p>

<h2>7. Derecho de revocación</h2>
<p>De acuerdo con el artículo 34 de la Ley 24.240 de Defensa del Consumidor, podés
arrepentirte de tu compra dentro de los <strong>10 días corridos</strong> desde que
recibís el producto o celebrás el contrato, lo que ocurra último, sin necesidad de
justificar el motivo y sin costo alguno. Para ejercerlo usá el
<a href="/arrepentimiento">Botón de arrepentimiento</a>.</p>

<h2>8. Garantía</h2>
<p>Los productos cuentan con la garantía legal prevista en los artículos 11 a 18 de la
Ley 24.240, además de la garantía del fabricante cuando corresponda.</p>

<h2>9. Propiedad intelectual</h2>
<p>Los contenidos del sitio (textos, imágenes, logos y diseño) son propiedad de
[RAZÓN SOCIAL] o se utilizan con autorización, y no pueden reproducirse sin
consentimiento previo.</p>

<h2>10. Ley aplicable y jurisdicción</h2>
<p>Estos términos se rigen por las leyes de la República Argentina. Ante cualquier
controversia serán competentes los tribunales ordinarios de [JURISDICCIÓN].</p>

<h2>11. Contacto</h2>
<p>Por cualquier consulta escribinos a <strong>[EMAIL DE CONTACTO]</strong>.</p>
`.trim()
  },
  {
    slug: 'privacidad',
    title: 'Política de Privacidad',
    sortOrder: 20,
    excerpt: 'Qué datos recolectamos y cómo los usamos.',
    content: `
<p>En <strong>[RAZÓN SOCIAL]</strong> (CUIT [CUIT]) protegemos tus datos personales
conforme a la <strong>Ley 25.326 de Protección de Datos Personales</strong>.</p>

<h2>1. Qué datos recolectamos</h2>
<ul>
  <li><strong>De registro:</strong> nombre, apellido, correo electrónico y teléfono.</li>
  <li><strong>De compra:</strong> domicilio de envío y facturación, y datos fiscales
      cuando corresponde emitir factura.</li>
  <li><strong>De navegación:</strong> páginas visitadas y productos vistos, para mejorar
      la experiencia del sitio.</li>
</ul>
<p>No almacenamos datos completos de tarjetas de crédito o débito: el pago lo procesa
la pasarela contratada.</p>

<h2>2. Para qué los usamos</h2>
<p>Para procesar y entregar tus pedidos, emitir comprobantes, brindarte soporte,
prevenir fraudes y —si nos diste tu consentimiento— enviarte novedades y promociones.</p>

<h2>3. Con quién los compartimos</h2>
<p>Únicamente con quienes son necesarios para cumplir la operación: empresas de
logística, pasarelas de pago y proveedores de facturación electrónica. No vendemos
ni cedemos tus datos a terceros con fines publicitarios.</p>

<h2>4. Tus derechos</h2>
<p>Podés acceder, rectificar, actualizar o suprimir tus datos personales escribiendo a
<strong>[EMAIL DE CONTACTO]</strong>. El titular de los datos tiene la facultad de
ejercer el derecho de acceso en forma gratuita a intervalos no inferiores a seis meses,
salvo que acredite un interés legítimo (art. 14, inciso 3 de la Ley 25.326).</p>
<p>La <strong>Agencia de Acceso a la Información Pública</strong>, en su carácter de
órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y
reclamos que se interpongan con relación al incumplimiento de las normas sobre
protección de datos personales.</p>

<h2>5. Seguridad</h2>
<p>Aplicamos medidas técnicas y organizativas razonables para proteger tus datos.
Las contraseñas se almacenan cifradas y el sitio opera bajo HTTPS.</p>

<h2>6. Conservación</h2>
<p>Conservamos los datos mientras tu cuenta esté activa y durante los plazos que exigen
las normas fiscales y comerciales.</p>
`.trim()
  },
  {
    slug: 'cookies',
    title: 'Política de Cookies',
    sortOrder: 30,
    excerpt: 'Qué cookies usamos y cómo gestionarlas.',
    content: `
<h2>Qué son las cookies</h2>
<p>Son pequeños archivos que el sitio guarda en tu dispositivo para recordar información
entre visitas.</p>

<h2>Cuáles usamos</h2>
<ul>
  <li><strong>Necesarias:</strong> mantienen tu sesión iniciada y el contenido del
      carrito. Sin ellas el sitio no funciona.</li>
  <li><strong>De preferencias:</strong> recuerdan ajustes como el tema visual.</li>
  <li><strong>De analítica:</strong> nos permiten entender de forma agregada cómo se
      usa el sitio para mejorarlo.</li>
</ul>

<h2>Cómo gestionarlas</h2>
<p>Podés bloquear o eliminar las cookies desde la configuración de tu navegador. Tené en
cuenta que si bloqueás las necesarias no vas a poder iniciar sesión ni completar una
compra.</p>
`.trim()
  },
  {
    slug: 'envios',
    title: 'Envíos',
    sortOrder: 40,
    excerpt: 'Plazos, costos y zonas de entrega.',
    content: `
<h2>Zonas y plazos</h2>
<p>Realizamos envíos a todo el país. El plazo estimado se informa en el checkout según
tu código postal y el método que elijas. Los plazos se cuentan en días hábiles desde la
acreditación del pago.</p>

<h2>Costos</h2>
<p>El costo se calcula automáticamente al ingresar tu domicilio, antes de confirmar la
compra. [Si aplicás envío gratis a partir de cierto monto, indicalo acá.]</p>

<h2>Seguimiento</h2>
<p>Cuando despachamos tu pedido te enviamos un correo con el número de seguimiento.
También podés consultarlo desde <a href="/pedidos">Mis pedidos</a>.</p>

<h2>Retiro en el local</h2>
<p>[Si ofrecés retiro, indicá acá el domicilio, los días y el horario de atención.]</p>

<h2>Si no estás cuando llega</h2>
<p>El correo deja un aviso de visita e intenta una nueva entrega. Pasados los intentos,
el paquete queda en la sucursal más cercana durante los días que indique el transportista.</p>
`.trim()
  },
  {
    slug: 'devoluciones',
    title: 'Cambios y Devoluciones',
    sortOrder: 50,
    excerpt: 'Cómo hacer un cambio, una devolución o usar la garantía.',
    content: `
<h2>Derecho de arrepentimiento (10 días)</h2>
<p>Podés arrepentirte de tu compra dentro de los <strong>10 días corridos</strong> desde
que recibís el producto, sin justificar el motivo y sin ningún costo, según el artículo
34 de la Ley 24.240. El producto debe estar sin uso y con su embalaje original.</p>
<p>Para iniciar el trámite usá el <a href="/arrepentimiento">Botón de arrepentimiento</a>.
El costo de la devolución corre por nuestra cuenta.</p>

<h2>Cambios</h2>
<p>Si querés cambiar un producto por otro talle, color o modelo, escribinos a
<strong>[EMAIL DE CONTACTO]</strong> dentro de los [X] días de recibido. El producto
tiene que estar sin uso y con su etiqueta original.</p>

<h2>Producto fallado o equivocado</h2>
<p>Si el producto llegó dañado, fallado o no es el que pediste, contactanos y lo
resolvemos sin costo para vos: podés elegir el reemplazo o la devolución del importe.</p>

<h2>Garantía</h2>
<p>Los productos tienen la garantía legal de los artículos 11 a 18 de la Ley 24.240,
además de la del fabricante cuando corresponda. Guardá tu comprobante de compra.</p>

<h2>Reintegros</h2>
<p>La devolución del dinero se hace por el mismo medio de pago utilizado. El plazo de
acreditación depende de tu banco o de la pasarela de pago.</p>
`.trim()
  },
  {
    slug: 'faq',
    title: 'Preguntas Frecuentes',
    sortOrder: 60,
    excerpt: 'Las consultas que más nos hacen.',
    content: `
<h2>¿Necesito crear una cuenta para comprar?</h2>
<p>Sí. Al registrarte podés seguir tus pedidos, guardar tus direcciones y agilizar las
próximas compras.</p>

<h2>¿Qué medios de pago aceptan?</h2>
<p>Los que ves en el checkout: tarjetas a través de la pasarela de pagos y transferencia
bancaria. Con transferencia tenés que subir el comprobante para que confirmemos el pedido.</p>

<h2>¿Cuánto tarda en llegar mi pedido?</h2>
<p>Depende de tu ubicación y del método de envío. El plazo estimado se muestra antes de
confirmar la compra. Ver <a href="/envios">Envíos</a>.</p>

<h2>¿Puedo seguir mi pedido?</h2>
<p>Sí, desde <a href="/pedidos">Mis pedidos</a>. Cuando lo despachamos te llega el número
de seguimiento por correo.</p>

<h2>¿Puedo devolver un producto?</h2>
<p>Sí, tenés 10 días corridos desde que lo recibís para arrepentirte, sin costo y sin
justificar el motivo. Ver <a href="/devoluciones">Cambios y Devoluciones</a>.</p>

<h2>¿Emiten factura?</h2>
<p>Sí, emitimos factura electrónica por cada compra. Si necesitás factura A, cargá tu
CUIT y condición fiscal en tu perfil antes de comprar.</p>

<h2>¿Cómo los contacto?</h2>
<p>Escribinos a <strong>[EMAIL DE CONTACTO]</strong> o desde la página de
<a href="/contacto">Contacto</a>.</p>
`.trim()
  },
  {
    slug: 'sobre-nosotros',
    title: 'Sobre Nosotros',
    sortOrder: 70,
    excerpt: 'Quiénes somos.',
    content: `
<p>[Contá acá la historia de tu tienda: cuándo empezaron, qué venden y qué los
diferencia. Dos o tres párrafos alcanzan.]</p>

<h2>Qué nos importa</h2>
<ul>
  <li>[Valor o diferencial 1]</li>
  <li>[Valor o diferencial 2]</li>
  <li>[Valor o diferencial 3]</li>
</ul>

<h2>Dónde estamos</h2>
<p>[Domicilio, si tenés local a la calle, con días y horarios de atención.]</p>
`.trim()
  },
  {
    slug: 'contacto',
    title: 'Contacto',
    sortOrder: 80,
    excerpt: 'Cómo comunicarte con nosotros.',
    content: `
<p>Estamos para ayudarte. Escribinos y te respondemos a la brevedad.</p>

<h2>Datos de contacto</h2>
<ul>
  <li><strong>Email:</strong> [EMAIL DE CONTACTO]</li>
  <li><strong>Teléfono / WhatsApp:</strong> [TELÉFONO]</li>
  <li><strong>Domicilio:</strong> [DOMICILIO]</li>
  <li><strong>Horario de atención:</strong> [HORARIO]</li>
</ul>

<h2>Consultas sobre un pedido</h2>
<p>Si tu consulta es por una compra, incluí el número de pedido para que podamos
ayudarte más rápido.</p>

<h2>Arrepentimiento de compra</h2>
<p>Si querés cancelar una compra dentro de los 10 días, usá directamente el
<a href="/arrepentimiento">Botón de arrepentimiento</a>.</p>
`.trim()
  },
  {
    slug: 'arrepentimiento',
    title: 'Botón de Arrepentimiento',
    sortOrder: 5,
    excerpt: 'Cancelá tu compra dentro de los 10 días corridos, sin costo.',
    content: `
<p>Según el artículo 34 de la <strong>Ley 24.240 de Defensa del Consumidor</strong> y la
<strong>Resolución 424/2020</strong>, podés arrepentirte de tu compra dentro de los
<strong>10 días corridos</strong> contados desde que recibís el producto o desde que
celebrás el contrato, lo que ocurra último.</p>
<p>No tenés que justificar el motivo y no tiene ningún costo para vos: los gastos de
devolución corren por nuestra cuenta.</p>
<p>Completá el formulario y te enviamos por correo el acuse de recibo con los pasos a
seguir.</p>
`.trim()
  }
];

async function seedContentPages() {
  try {
    let creadas = 0;

    for (const page of DEFAULT_PAGES) {
      // findOrCreate: si la tienda ya edito la pagina, no se pisa su texto.
      const [, created] = await ContentPage.findOrCreate({
        where: { slug: page.slug },
        defaults: { ...page, isSystem: true, isPublished: true }
      });
      if (created) creadas++;
    }

    if (creadas > 0) {
      logger.info(`Content pages seeded: ${creadas} nuevas`);
    }
  } catch (error) {
    logger.error('Error seeding content pages:', error);
    throw error;
  }
}

// Permitir ejecutar el script directamente
if (require.main === module) {
  seedContentPages()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedContentPages;
