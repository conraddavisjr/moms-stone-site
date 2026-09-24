import Storefront from '../../storefront';
export default async function Stone({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Storefront initialView="catalog" initialId={id}/>}
