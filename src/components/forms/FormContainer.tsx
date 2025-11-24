import prisma from "@/lib/prisma";
import FormModal from "../FormModal";

export type FormContainerProps = {table:
    | "user"
    | "building"
    | "dataCategory"
    | "inspection"
    | "reading";
    type: "create" | "update" | "delete";
    data?: any;
    id?: number | string;
}

const FormContainer = async({ table,
    type,
    data,
    id,
}: FormContainerProps) => {

    let relatedData = {};

    if(type!== "delete"){
        switch(table){
            case "building":
                const buildingDataCategories = await prisma.building.findMany({
                    select:{id:true, name:true},
                });
                relatedData = {buildings: buildingDataCategories};
                break;
            case "user":
                const userInspections = await prisma.user.findMany({
                    select:{id:true, firstName:true},
                });
                relatedData = {user: userInspections};
                break;
        }
        
    }
    return (
        <div className=''><FormModal table={table} type={type} data={data} id={id}/></div>
    )
}

export default FormContainer