import { getServerSession } from "next-auth"
import RegisterForm from "./register-form"
import { redirect } from "next/navigation"
import { getServerAuthSession } from "~/server/auth";

const Register = async() => {
    const session = await getServerAuthSession()
    if(session){
        redirect("/")
    }
    return(
        <>
        <RegisterForm/>
        </>
    )
}
export default Register