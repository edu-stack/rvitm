import React from 'react'
import './FacultyMobileNav.css'
import { BiHome }from 'react-icons/bi'
import {RiHistoryLine} from 'react-icons/ri'
import {CgProfile} from 'react-icons/cg'
import { NavLink } from 'react-router-dom'
import {BsPersonCheck} from 'react-icons/bs'
import { useUserAuth } from "../Backend/context/UserAuthContext";


const FacultyMobileNav = () => {
	const { user } = useUserAuth();

  return (
    <>
    <nav class="faculty-mobile-bottom-nav">

    
	<div class="faculty-mobile-bottom-nav__item " >
	<NavLink style={{textDecoration: 'none'}} 
	to={'/faculty/dashboard'}
	className={ window.location.pathname.endsWith("/dashboard") ? 'active-button' : 'inactive-button'}
	>
		<div class="mobile-bottom-nav__item-content">

			<i><BiHome style={{fontSize: '18px'}}/></i>
			Home
		</div>		
	</NavLink>
	</div>


	<div class="faculty-mobile-bottom-nav__item " >
	<NavLink style={{textDecoration: 'none'}}
	to={'/faculty/dashboard/attendance/new'}

	className={ window.location.pathname.endsWith("/new") ? 'active-button' : 'inactive-button'}
	>
		<div class="mobile-bottom-nav__item-content">
			<i class="material-icons"><BsPersonCheck style={{fontSize: '18px'}}/></i>
			Attendance
		</div>
		</NavLink>		
	</div>
	<div class="faculty-mobile-bottom-nav__item">
	<NavLink style={{textDecoration: 'none'}}
	to={'/faculty/dashboard/attendance'}
	className={ window.location.pathname.endsWith("/attendance") || window.location.pathname.endsWith("/history") ? 'active-button' : 'inactive-button'}
	>
		<div class="mobile-bottom-nav__item-content">
			<i class="material-icons"><RiHistoryLine style={{fontSize: '18px'}}/> </i>
			History
		</div>
	</NavLink>		
	</div>

	
	
	<div class="faculty-mobile-bottom-nav__item">
    <NavLink style={{textDecoration: 'none'}}
	to={'/faculty/dashboard/profile'}
	className={ window.location.pathname.endsWith("/profile") ? 'active-button' : 'inactive-button'}>
		<div class="mobile-bottom-nav__item-content">
			<i class="material-icons">
			{user.photoURL ?             <img
              src={user.photoURL}
              alt="Profile"
              style={ window.location.pathname.endsWith("/profile") ? {width: "18px", border: '1px solid #2f2f2f'} : { width: "18px"} }
              className='profile-image'
            /> :<CgProfile  style={{fontSize: '18px'}}/>}
			
			</i>
			Profile
		</div>	
        </NavLink>	
	</div>


</nav> 
</>
  )
}

export default FacultyMobileNav;