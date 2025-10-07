import "./style.css"
import chefCloudeLogo from "../images/pngegg.png"


export default function Header(){
    return(
        <header>
            <img src={chefCloudeLogo}/>
            <h2>Chef Claude</h2>
        </header>
    )
}