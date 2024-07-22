import './AddPassword.css'
import { useState } from 'react';
import axios from 'axios'

const AddPassword=()=>{
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [account,setAccount]=useState('');
    const [error, setError] = useState('');
    

    async function getKeyFromLocalStorage() {
      const jwkString = localStorage.getItem('webkey');
      if (!jwkString) {
          throw new Error('No key found in localStorage');
      }
      
      const jwk = JSON.parse(jwkString);
      return window.crypto.subtle.importKey(
          'jwk',
          jwk,
          { name: 'AES-GCM' },
          true,
          ['encrypt', 'decrypt']
      );
  }

    async function encryptData(key,data){
      const iv= window.crypto.getRandomValues(new Uint8Array(12));
      const enc=new TextEncoder();
      const encrypted=await window.crypto.subtle.encrypt(
        {
          name:'AES-GCM',
          iv:iv
        },
        key,
        enc.encode(data)
      );
       return {
         iv:iv,
         encryptedData: new Uint8Array(encrypted)
       };
    }
    const addPasswordHandler= async(event)=>{
        event.preventDefault();
        
        const config = {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        };
        
        let user=username.trim();
        let pass=password.trim();
        let acc=account.trim();

        if(user==='' || pass==='' || acc===''){
          setUsername(user);
          setPassword(pass);
          setAccount(acc);
          alert('Empty fields are not allowed');
        }else{
          setUsername('');
          setPassword('');
          setAccount('');
          //----------------------------------------------------------
          let key = await getKeyFromLocalStorage();
          console.log(key);

          const {iv,encryptedData}=await encryptData(key,pass);
          console.log(iv.toString(),encryptedData.toString());
          console.log(new Uint8Array(iv.toString().split(',')));
          try {
            const {data} = await axios.post(
              'http://localhost:5000/api/add',
              {account:acc,username:user,password:encryptedData.toString(), IV:iv.toString()},
              config
            )
            alert(JSON.stringify(data));
           
            
          } catch (error) {
            setError(error.toString());
            setTimeout(() => {
              setError('');
            }, 5000);
          }
         }
    }

   return(
    <div className="pass-add-screen">
      <form onSubmit={addPasswordHandler} className="pass-add-screen__form">
        <h3 className="pass-add-screen__title">Password Add</h3>
        {error && <span className="error-message">{error}</span>}

        <div className="form-group">
          <label htmlFor="account">Account name to which password is assosiated:</label>
          <input
            type="text"
            name="account"
            id="account"
            placeholder="eg=> Gmail,Instagram"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            tabIndex={1}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="username"
            name="username"
            id="username"
            value={username}
            placeholder="username / email / mobile"
            onChange={(e) => setUsername(e.target.value)}
            tabIndex={1}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Password:{' '}
          </label>
          <input
            tabIndex={2}
            type="text"
            name="password"
            id="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>


        <button type="submit" className="btn btn-primary" tabIndex={3}>
          Submit
        </button>
      </form>
    </div>

   );
}

export default AddPassword;