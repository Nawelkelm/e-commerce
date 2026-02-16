import { Helmet } from 'react-helmet-async'

const PageMeta = ({ title, description, keywords }) => {
  const siteName = 'E-Commerce'
  const fullTitle = title ? `${title} - ${siteName}` : siteName
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
    </Helmet>
  )
}

export default PageMeta
