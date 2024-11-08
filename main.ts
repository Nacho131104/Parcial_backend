import {MongoClient} from 'mongodb';
import type { PersonaModel } from "./types.ts";
import {  fromModeltoPersona } from "./resolvers.ts";


const MONGO_URL = Deno.env.get("MONGO_URL");
if(!MONGO_URL){
  console.error("MONGO_URL not set");
  Deno.exit(1)
}

const client = new MongoClient(MONGO_URL);
await client.connect();
const db = client.db("BaseParcial")

const coleccionDePersonas =  db.collection<PersonaModel>('personas');

const handler =async(rq:Request):Promise<Response> =>{
  const metodo = rq.method;
  const url = new URL(rq.url);
  const ruta = url.pathname;

  if(metodo ==="GET"){
    if(ruta ==="/personas"){
      const nombre = url.searchParams.get("nombre");
      if(nombre){
        const personasPorNombre = await coleccionDePersonas.find({nombre}).toArray();
        const personas = await personasPorNombre.map((p)=>fromModeltoPersona(p,coleccionDePersonas));
        return new Response(JSON.stringify(personas));
      }
      else{
        const personasPorNombre = await coleccionDePersonas.find().toArray();
        const personas = await personasPorNombre.map((p)=>fromModeltoPersona(p,coleccionDePersonas));
        return new Response(JSON.stringify(personas));
      }
    }
    else if(ruta==="/persona"){
      const email = url.searchParams.get("email");
      if(email){
        const personaDB = await coleccionDePersonas.findOne({email,})
        if(personaDB){
        return new Response(JSON.stringify(personaDB));
        }
        return new Response("Email not found",{status:404})
      }
      return new Response("Bad request",{status:400})
    }
    return new Response("Bad request",{status:400});
  }
  else if (metodo ==="POST"){
    if(ruta ==="/personas"){
      const body = await rq.json();
      if(!body.nombre || !body.telefono ||!body.email){
        return new Response("Bad request",{status:400})
      }
      const personaRegistrada = await coleccionDePersonas.find({email:body.email,telefono:body.telefono})
      if(personaRegistrada){
        return new Response("Bad request",{status:400})
      }
      coleccionDePersonas.insertOne({
        nombre:body.nombre,
        email:body.email,
        telefono:body.telefono,
        amigos:body.amigos
      })

      return new Response(
        JSON.stringify(
          {
            nombre:body.nombre,
            email:body.email,
            telefono:body.telefono,
            amigos:body.amigos,
          })
      )
    }
    return new Response("Bad request",{status:400})
  }
  else if(metodo ==="PUT"){
    if(ruta ==="/persona"){
      const body = await rq.json();
      if(!body.nombre || !body.email || !body.telefono){
        return new Response("Bad request",{status:400})
      }
      const emailDB = await coleccionDePersonas.find({email:body.email})
      if(!emailDB){
        return new Response("Email not found",{status:404})
      }
      await coleccionDePersonas.updateOne(
        {email:body.email},
        {$set:{nombre:body.nombre,telefono:body.telefono,amigos:body.amigos}}
      )
      return new Response("Ok",{status:201})
    }
    return new Response("Bad request",{status:400})
  }
  else if(metodo ==="DELETE"){
    if(ruta ==="/persona"){
      const email = url.searchParams.get("email");
      if(!email){
        return new Response("Bad request",{status:400})
      }
      const personaDB = await coleccionDePersonas.findOne({email})
      if(!personaDB){
        return new Response("Persona not found",{status:404})
      }
      await coleccionDePersonas.deleteOne(
        {email}
      )
      await coleccionDePersonas.deleteMany(
        {Persona: email}
      )
    }
  }
  return new Response("Endpoint not found",{status:404});
}

Deno.serve({port:3000},handler);