import { useContext, useEffect, useState } from 'react'
import { ThemeContext } from './contexts/theme'
import AddPassword from './components/Password/AddPassword'
import './App.css'
import Password from './components/Password/Password'
import Login from './components/Login'

const App = () => {
  const [{ themeName }] = useContext(ThemeContext)
  
  return (
    <div id='top' className={`${themeName} app`}>
     
      <div className="lock">
        <div className="lock-text">
           <p className="lock-text-style">Keep your <b>passwords</b> <br/> safe and easy to <br/> access </p>
        
           <img className="lock-img-style" src="./images/padlock.png"/>
        </div>

        <div className='lock-form'>
                       {/* login */}
          {localStorage.getItem('authToken')==null && <Login/>} 
          {localStorage.getItem('authToken')!=null && <AddPassword/>}
        </div> 
      </div>

      <main>
        {localStorage.getItem('authToken') && <Password />}
      </main>
      
    </div>
    
  )
}

export default App
