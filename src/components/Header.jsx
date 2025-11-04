import React from "react";
import "./Header.css";

export default function Header(){
    return(
        <>
         <header>
            <div className="logo-container">
             <a className="inner-container"href="/">
              <img src="https://img.icons8.com/ios-filled/50/000000/trophy.png" alt="Trophy Icon" />
              Rewards App
            </a>   
            </div>                
            <nav>
                 {/* <a className="nav-menu" href="/customers">Customers</a> */}
                 <a className="nav-menu" href="/manage-rewards">Manage Rewards</a>
            </nav>
            <a href="https://www.atmaaisolutions.com/" className="contact-us" target="_blank" rel="noopener noreferrer">
                Contact US
            </a>
         </header>
        </>
    )
}