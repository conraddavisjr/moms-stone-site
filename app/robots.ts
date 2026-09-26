import {indexingEnabled,siteOrigin} from '@/lib/seo';
export default function robots(){return {rules:{userAgent:'*',...(indexingEnabled?{allow:'/',disallow:['/admin','/api/']}:{disallow:'/'})},sitemap:`${siteOrigin}/sitemap.xml`}}
