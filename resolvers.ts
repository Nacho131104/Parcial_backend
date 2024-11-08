import { Collection,ObjectId } from "mongodb";
import type {Persona,PersonaModel} from './types.ts'


export const fromModeltoPersona=async(
    P:PersonaModel,
    coleccionDePersonas: Collection<PersonaModel>
):Promise<Persona>=>{

    const PersonDB = await coleccionDePersonas.findOne({nombre:P.nombre})
    return {
        nombre:PersonDB!.nombre,
        email:PersonDB!.email,
        telefono:PersonDB!.telefono,
        amigos:PersonDB!.amigos.map((id:ObjectId)=>fromAmigosModeltoString(id)),
    }
}


export const fromAmigosModeltoString=(a:ObjectId)=>{
    return a!.toString();
}