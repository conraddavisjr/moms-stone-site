import {sqliteTable,text,integer,index,primaryKey} from 'drizzle-orm/sqlite-core';
export const products=sqliteTable('products',{id:text('id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(1),updatedAt:text('updated_at').notNull()});
export const revisions=sqliteTable('revisions',{id:integer('id').primaryKey({autoIncrement:true}),productId:text('product_id').notNull(),data:text('data').notNull(),createdAt:text('created_at').notNull(),author:text('author').notNull()},t=>[index('revisions_product').on(t.productId)]);
export const carts=sqliteTable('carts',{session:text('session').notNull(),productId:text('product_id').notNull(),quantity:integer('quantity').notNull()},t=>[primaryKey({columns:[t.session,t.productId]})]);
export const events=sqliteTable('events',{id:integer('id').primaryKey({autoIncrement:true}),session:text('session').notNull(),type:text('type').notNull(),productId:text('product_id'),createdAt:text('created_at').notNull()},t=>[index('events_created_at').on(t.createdAt)]);
export const uploads=sqliteTable('uploads',{key:text('key').primaryKey(),name:text('name').notNull(),type:text('type').notNull(),size:integer('size').notNull(),author:text('author').notNull(),createdAt:text('created_at').notNull()});
// One accepted Wonder Card per bag session. The primary key makes acceptance idempotent and final.
export const wonderCards=sqliteTable('wonder_cards',{session:text('session').primaryKey(),cardId:integer('card_id').notNull(),acceptedAt:text('accepted_at').notNull()});
