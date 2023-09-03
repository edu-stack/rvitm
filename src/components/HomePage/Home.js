import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';


const Home = () => {
  const logoSrc = '/logorv.png';
  const EduStack = '/Edu-Stack.png';

  return (
    <>
      <div style={{
        position: 'absolute',
top: 0,
left: '50%',
transform: 'translate(-50%,0)',
minHeight: '40%',
width: '100%',
background: 'linear-gradient(0deg, #a77dc2 0%, #e3d1e5 60%, #fff 100%)',
borderBottomLeftRadius: '25%',
maxWidth: '600px',
borderBottomRightRadius: '25%',
boxShadow: '0 4px 5px rgba(0,0,0,.1)',

      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            position: 'absolute',
          }}
        >
          <img
            style={{
              maxWidth: '180px',
            }}
            src={EduStack}
            alt="EduStack"
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -40%)', // Center horizontally and vertically
          minWidth: '120px',
          minHeight: '120px',
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
      >
        <img
          src={logoSrc}
          style={{
            maxWidth: '120px',
            overflow: 'hidden',
            borderRadius: '50%',
            padding: '10px',
            boxShadow: '0 4px 5px rgba(0,0,0,.1)'
          }}
          alt="EduStack"
        />
      </div>
      
      <div
  style={{
    position: 'absolute',
    top: '52%', 
    width: '100%',
    textAlign: 'center', // Center-align the text
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center', 
  }}
>
  <h3 style={{ fontSize: '24px', fontWeight: '500',}}>
    Welcome to EduStack RVITM
  </h3>
  <p style={{ fontSize: '15px', fontFamily: 'Golos Text',color: 'grey', marginTop: '10px',maxWidth: '330px'}}>
    A Platform Built to Simplify Attendance Tracking & Academics
  </p>
  </div> 
    <div style={{position: 'absolute',left: '50%', transform: 'translate(-50%,10%)', bottom: '7%',display: 'flex',alignItems: 'center',flexDirection: 'column',minWidth: '350px'}}>

    <NavLink to='student/dashboard' style={{minWidth: '300px',textDecoration: 'none'}}>
    <button className="primary-button"                    style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '100%',
            fontFamily: 'Golos Text',
            padding: '10px',
            backgroundColor: '#9c27b0',
            border: 'none',
            color: 'white',
            borderRadius: '25px',
            marginBottom: '20px',
            textDecoration: 'none'
          }}
          >
           
      <span  style={{ flex: 1 }}>Sign In as Student</span> <FiChevronRight/>
      
      
    </button>
    </NavLink>
    
    <NavLink to='faculty/dashboard' style={{minWidth: '300px', textDecoration: 'none'}}>
    <button className="secondary-button"           style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: '100%',
            fontFamily: 'Golos Text',
            padding: '10px',
            backgroundColor: 'white',
            border: 'none',
            color: '#9c27b0',
            borderRadius: '25px',
            marginBottom: '10px',
            border: '2px solid #9c27b0',
          }}>
      <span style={{ flex: 1 }}>Sign In as Faculty</span><FiChevronRight/>
    </button>
    </NavLink>
    <button className="tertiary-button" style={{ minWidth: '80%', fontFamily: 'Golos Text', padding: '10px',backgroundColor: 'white',border: 'none',color: '#9c27b0',borderRadius: '25px', marginBottom: '15px' }}>
      Sign In as Parent
    </button>
    </div>

    


<div style={{position: 'absolute', bottom: '1%',left: '50%', transform: 'translate(-50%,1%)' ,display: 'flex',alignItems: 'center',flexDirection: 'column',textAlign: 'center' }}><p style={{margin: 0,padding: 0, fontSize: '12px', color: 'grey'}}>© 2023 <span style={{textDecoration: 'underline'}}>WallSoft pvt ltd.</span></p></div>
    </>
  );
};

export default Home;
