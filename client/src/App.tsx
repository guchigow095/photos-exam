import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useAppSelector } from './hooks/useAppSelector'
import axios from 'axios'
import { setPhotos } from './store/photosSlice'
import PhotoForm from './components/PhotoForm'
import { PhotoList } from './components/PhotoList'

function App() {
  const dispatch = useDispatch()
  const photos = useAppSelector(state => state.photos.photos)

  useEffect(()=>{
    const fetchProducts = async ()=>{
      try {
        const response = await axios.get('http://localhost:3000/photos')
        dispatch(setPhotos(response.data))
      } catch (error) {
        console.error('Ошибка при получении продукта' , error)
      }
    }
    fetchProducts()
  }, [dispatch])

  return (
    <>
      <div>
        <h1>Фото</h1>
        <PhotoForm/>
        {photos.length === 0 ? (
          <p>Пока нет фотков. Добавьте первую!</p>
        ) : (
          <PhotoList/>
        )}
      </div>
    </>
  )
}

export default App
