const prodURL = process.env.NEXT_PUBLIC_PRODUCTION_URL;
const devURL = process.env.NEXT_PUBLIC_DEVELOPMENT_URL;

const baseURL = process.env.NODE_ENV === 'development' ? devURL : prodURL;

export default baseURL;
