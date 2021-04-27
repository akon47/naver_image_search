import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Logo = () => {
  return (
    <div className='logo'>
      <h1>
        <span>이</span>
        <span>미</span>
        <span>지</span>
        <span> </span>
        <span>검</span>
        <span>색</span>
      </h1>
    </div>
  )
}

const SearchBar = (props) => {
  return (
    <center>
      <div className='search-bar'>
        <input className='search-textbox' type='text' placeholder='검색어 입력' onChange={(e) => props.onTextChange(e.target.value)} onKeyPress={(e) => {if(e.key === 'Enter') { props.onSearch(); }}}></input>
        <button className='search-button' onClick={() => props.onSearch()}>
          <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path style={{fill: '#4285f4'}} d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </button>
      </div>
    </center>
  );
}

const ImageBox = (props) => {
  return (
    <div className='image-box'>
      <img src={props.data.thumbnail_url} title={props.data.title} alt="" />
      <div className='image-box-title'>
        <a href={props.data.url} target='_blank'>{props.data.title}</a>
      </div>
    </div>
  );
}

const App = () => {
  const [images, setImages] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [lastSearchText, setLastSearchText] = useState('');
  const [lastStart, setLastStart] = useState(1);
  const [needMoreSearch, setNeedMoreSearch] = useState(false);
  const [hitBottom, setHitBottom] = useState(false);

  useEffect(() => {

    if(hitBottom && needMoreSearch) {
      const api_url = 'https://kimhwan.kr/api/naver_image_search?display=100&query=' + encodeURI(searchText) + '&start=' + (lastStart + 100);
      const options = {
        url: api_url,
        method: 'GET'
      }
      axios(options)
      .then((response) => {
        console.log(response.data);
        const results = response.data.items.map((i) => ({ url: i.link, thumbnail_url: i.thumbnail, size: { w: i.sizewidth, h: i.sizeheight }, title: i.title }));
        setImages(prev => prev.concat(results));
        setLastStart(response.data.start);
        setHitBottom(false);
      })
      .catch((response) => {
        setImages([]);
      });
    }

  }, [hitBottom]);

  useEffect(() => {
    console.log('add scroll event'); 
    window.addEventListener("scroll", infiniteScroll);
    return () => {
      console.log('remove scroll event');
      window.removeEventListener("scroll", infiniteScroll);
    };
  }, []);

  const handleSearch = () => {
    if(searchText !== lastSearchText) {
      setLastSearchText(searchText);
      const api_url = 'https://kimhwan.kr/api/naver_image_search?display=100&query=' + encodeURI(searchText) + '&start=' + 1;
      const options = {
        url: api_url,
        method: 'GET'
      }
      axios(options)
      .then((response) => {
        console.log(response.data);
        const results = response.data.items.map((i) => ({ url: i.link, thumbnail_url: i.thumbnail, size: { w: i.sizewidth, h: i.sizeheight }, title: i.title }));
        setImages([].concat(results));
        setNeedMoreSearch(response.data.total > (response.data.start + response.data.display));
        setLastStart(response.data.start);
      })
      .catch((response) => {
        setImages([]);
      });
    }
  }

  const infiniteScroll = () => {
    let scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    let scrollTop = Math.max(
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    let clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight) {
      console.log('setHitBottom(true)');
      setHitBottom(true);
    }
  };


  let result = [];
  for(let i = 0; i < images.length; i++) {
    result.push(<ImageBox data={images[i]}></ImageBox>);
  }

  return (
    <div className='app'>
      <Logo />
      <SearchBar onSearch={() => handleSearch()} onTextChange={setSearchText}/>
      <div className='result-container'>
        {result}
      </div>
    </div>
  );
}

export default App;
