import { CreateOptions, DeleteResult, FlattenMaps, HydratedDocument, Model, MongooseUpdateQueryOptions, ProjectionType, QueryOptions, RootFilterQuery, Types, UpdateQuery, UpdateWriteOpResult } from "mongoose";
export type Lean<T>=FlattenMaps<T>
export abstract class DataBaseRepository<TRawDocument,TDocument=HydratedDocument<TRawDocument>>{

protected constructor(protected model:Model<TDocument>){}

async findOne({
    filter,
    select,
    options
  }:{
    filter?:RootFilterQuery<TRawDocument>,
    select?:ProjectionType<TRawDocument>|null,
    options?:QueryOptions<TDocument>|null
  }):Promise<HydratedDocument<TDocument>|null>{
    let query = this.model.findOne(filter ?? {}, null, options ?? undefined).select(select||"");
    if (options?.populate) query = query.populate(options.populate as any);
    return await query as unknown as HydratedDocument<TDocument> | null;
}
async paginte({
    filter={},
    options={},
    select,
    page=1,
    size=5,
}:{
    filter:RootFilterQuery<TDocument>,
    select?:ProjectionType<TDocument>|undefined,
    options?:QueryOptions<TDocument>|undefined,
    page?:number|"all",
    size?:number,
}):Promise<{docsCount?: number, limit?: number, pages?: number, currentPage?: number, result: HydratedDocument<TDocument>[]}>{ 

let docsCount:number|undefined=undefined
let pages:number|undefined=undefined
if(page!="all"){
    pages=Math.floor(!page||page<1?1:page)
options.limit=Math.floor(size<1||!size?5:size)
options.skip=Math.floor((pages-1)*options.limit)
docsCount=await this.model.countDocuments(filter)
pages=Math.ceil(docsCount/options.limit)
}
const result=await this.model.find(filter,select,options)
return {
    docsCount: docsCount || 0,
    limit: options.limit || 0,
    pages: pages || 0,
    currentPage: typeof page === 'number' ? Math.floor(page<1?1:page) : 1,
    result
}}
   
async find({
  filter,
  select,
  options,
}: {
  filter?: RootFilterQuery<TRawDocument>;
  select?: ProjectionType<TRawDocument> | null;
  options?: QueryOptions<TDocument> | null;
}): Promise<HydratedDocument<TDocument>[]> {
  return this.model
    .find(filter ?? {}, null, options)
    .select(select ?? "")
    .exec() as Promise<HydratedDocument<TDocument>[]>;
}
async findByIdAndUpdate({
    id,
    update,
    options={new:true},
}:{
    id:Types.ObjectId;
    update?:UpdateQuery<TDocument>;
    options?:QueryOptions<TDocument>|null;


}):Promise<HydratedDocument<TDocument>|null>{
    return this.model.findByIdAndUpdate(id,{
        ...update,$inc:{__v:1}
    },options)
}

async findOneAndUpdate({
    filter,
    update,
    options={new:true},
}:{
    filter:RootFilterQuery<TRawDocument>;
    update?:UpdateQuery<TDocument>;
    options?:QueryOptions<TDocument>|null;
}):Promise<HydratedDocument<TDocument>|null>{
    if (Array.isArray(update)) {
        return this.model.findOneAndUpdate(filter, update as any, options);
    }
    return this.model.findOneAndUpdate(filter, { ...(update || {}), $inc: { __v: 1 } } as any, options);
}
async findOneAndDelete({
    filter
   
}:{
    filter:RootFilterQuery<TRawDocument>;
   
}):Promise<HydratedDocument<TDocument>|null>{
    return this.model.findOneAndDelete(filter)
}

  async deleteMany(filter: RootFilterQuery<TRawDocument>): Promise<number> {
    const res = await this.model.deleteMany(filter as any);
    // @ts-ignore
    return res?.deletedCount ?? 0;
  }

  async deleteOne(filter: RootFilterQuery<TRawDocument>): Promise<DeleteResult> {
    const res = await this.model.deleteOne(filter as any);
 
    return res 
  }


    async  create({
        data,
        options,
    }:{
        data:Partial<TRawDocument>;
    
        options?:CreateOptions|undefined
    }):Promise<HydratedDocument<TDocument>> {
      if (options) {
        const created = await this.model.create([data], options);
        return created[0] as HydratedDocument<TDocument>;
      } else {
        return await this.model.create(data) as HydratedDocument<TDocument>;
      }
    }

    async  createMany({
        data,
        options,
    }:{
        data:Partial<TDocument>[];
    
        options?:CreateOptions|undefined
    }):Promise<HydratedDocument<TDocument>[]> {
      return  await this.model.create(data,options) as HydratedDocument<TDocument>[];
    }


async updateOne({
filter,
update,
    options
}:{
    filter:RootFilterQuery<TRawDocument>;
    update:UpdateQuery<TDocument>;
    options?:MongooseUpdateQueryOptions<TDocument>

}):Promise<UpdateWriteOpResult>
{
    return await this.model.updateOne(filter,{$inc:{__v:1},...update},options)
}


}


