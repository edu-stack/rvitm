import "./Student.css";
import { Alert } from "react-bootstrap";
import { UilEyeSlash, UilEye } from '@iconscout/react-unicons'; 

import { useUserAuth } from "../../Backend/context/UserAuthContext";
import { signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, getDoc, Timestamp,collection,  collectionGroup, query, where, getDocs } from "firebase/firestore";



import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../../Backend/Firebase/firebase";
import { db } from '../../Backend/Firebase/firebase';
import { AiOutlineBackward, AiOutlineLeft } from "react-icons/ai";

const Student = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Added loading state
  const { googleSignIn } = useUserAuth();
  const navigate = useNavigate();
  const { logOut, user } = useUserAuth();

  useEffect(() => {
    if (user && user.email) {
      const fetchData = async () => {
        const queryPath = 'students'; // Update this to the subcollection path
        const collectionGroupRef = collectionGroup(db, queryPath);
        const facultiesQuery = query(collectionGroupRef, where('email', 'array-contains', user.email));
  
        const facultiesSnapshot = await getDocs(facultiesQuery);
        const classSubjectPairsList = [];
  
        await Promise.all(facultiesSnapshot.docs.map(async (facultyDoc) => {
          const className = facultyDoc.ref.parent.parent.id;
          const classDocRef = doc(db, 'database', className); // Update with your class collection name
          const classDocSnapshot = await getDoc(classDocRef);
  
          if (classDocSnapshot.exists()) {
            const classData = classDocSnapshot.data();
            const classSemester = classDocSnapshot.data().currentSemester;
            console.log(classSemester)
            const code = facultyDoc.data().code;
            const subjectName = facultyDoc.data().name;
            const subjectType = facultyDoc.data().theoryLab;
            const subSemester = facultyDoc.data().semester;
  
            classSubjectPairsList.push({ className, code, subjectName, subjectType, subSemester,classSemester, ...classData });
          }
        }));
  
       
      };
  
      fetchData();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true); // Set loading state to true



    
    try {
      await signInWithEmailAndPassword(auth, email, password)
        .then(async (res) => {
          const user = res.user;
          const getRef = doc(db , 'users' , user.uid);
  
          // Check if the user document exists
          const userDoc = await getDoc(getRef);
          navigate("/student/dashboard");
  
          try {
            // if (userDoc.exists) {
            //   const userData = userDoc.data();
            //   if (userData.type === 'student') {
            //     if (user.emailVerified) {
                  navigate("/student/dashboard");
            //     } else {
            //       setError("Please verify your email address before logging in. Alternatively, you can use Google Sign In");
            //       await logOut();
            //     }
            //   } else {
            //     setError("Only student accounts are allowed to log in.");
            //     await logOut();
            //   }
            // } else {
            //   setError("User account not found.");
            //   await logOut();
            // }
          } catch (err) {
            setError('user not found');
          }
  
          setIsLoading(false); // Set loading state to false
        })
        .catch((error) => {
          setError(error.message);
          setIsLoading(false); // Set loading state to false
        });
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Set loading state to false
    }
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    try {
      await googleSignIn().then(async (res) => {
        const user = res.user;
        const getRef = doc(db , 'users' , user.uid);

        // Check if the user document exists
        const userDoc = await getDoc(getRef);

        try {  
          if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.type === 'student') {
              if (user.emailVerified) {
                navigate("/student/dashboard");
              } else {
                setError("Please verify your email address before logging in. Alternatively, you can use Google Sign In");
              }
            } else {
              setError("Please Sign Up before Logging in using Google");
              await logOut();
            } 
          } else {
            setError("User account not found.");
          }
        } catch(err) {
          setError('Please Sign Up using your USN before logging in');
          await user.delete();
        }

        setIsLoading(false); // Set loading state to false
      });
    } catch (err) {
      setError(err.message);
      setIsLoading(false); // Set loading state to false
    }
  };

  const [passwordShown, setPasswordShown] = useState(false);

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setPasswordShown(!passwordShown);
  };

  return (
    <div className="auth-body">
      <div style={{padding: '10px'}}>
        <NavLink to='/' style={{textDecoration: 'none', fontWeight: '500'}}>
       <AiOutlineLeft/> {'Home'} 
       </NavLink> 
      </div>
      <div className="logincontainer">
        <form className="loginform" style={{ borderRadius: '10px' }}>
          <div style={{display: 'flex',alignItems: 'center', justifyContent: 'center',marginBottom: '40px'}}>
          <img style={{maxWidth: '50%'}} src='/EduStack-Logo.svg'/>
          </div>
          <h4 className="loginhead" style={{ textAlign: 'center', fontWeight: 'normal', padding: '0px', fontSize: '18px' }}>
            Log in to your Student Account
          </h4>
          <p className="" style={{ textAlign: 'center', margin: '20px' }}></p>

          <div className="form-group" style={{ paddingBottom: '0px' }}>
            <input
              type="email"
              className="formcontrol"
              name="email"
              id="email"
              value={email}
              style={{ backgroundColor: 'white' ,borderRadius: '25px'}}
              onChange={(e) => setEmail(e.target.value)}
              required
        
            />
            <label htmlFor="email" style={{ marginLeft: '10px' }}>College Email address</label>
          </div>

          <div className="form-group" style={{ paddingBottom: '0px' }}>
            <input
              type={passwordShown ? "text" : "password"}
              className="formcontrol"
              name="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{borderRadius: '25px'}}
            />
            <label htmlFor="password" style={{ marginLeft: '10px' }}>Password</label>
            <button onClick={togglePasswordVisibility} className="passwordbutton">
              {passwordShown ? <UilEye /> : <UilEyeSlash />}
            </button>
          </div>

          {error && <Alert variant="danger" style={{ fontSize: '12px' }}>{error}</Alert>}

          <span>
            <p style={{ fontSize: '14px', marginLeft: '10px' }}>
              <NavLink style={{ textDecoration: 'none' }} to="/auth/forgotpassword">Reset Password</NavLink>
            </p>
          </span>

          <button
            type="submit"
            name="signup"
            id="signup"
            className="auth-submit"
            onClick={handleSubmit}
            disabled={isLoading} // Disable the button while loading
            style={{borderRadius: '25px'}}
          >
            {isLoading ? "Loading..." : "Log In"} {/* Display loading text or Log In */}
          </button>

          <span>
            <p style={{ fontSize: '14px', marginLeft: '10px', marginTop: '20px' }}>
              Don't have an account? <NavLink style={{ textDecoration: 'none' }} to="/student/signup">Sign up</NavLink>
            </p>
          </span>

          <div className="or">
            <hr className="bar" />
            <span className="or-text">OR</span>
            <hr className="bar" />
          </div>

          <button className="google-button" style={{borderRadius: '25px'}} onClick={handleGoogleSignIn} disabled={isLoading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo"></img> Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Student;
