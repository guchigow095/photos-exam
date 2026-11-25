import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Photo {
  id: number;
  title: string; // название фотографии
  image_url: string; // путь к файлу на сервере
}

interface PhotosState {
  photos: Photo[];
  selectedPhoto?: Photo;
}

const initialState: PhotosState = {
  photos: [],
  selectedPhoto: undefined,
};

const photosSlice = createSlice({
  name: "photos",
  initialState,
  reducers: {
    setPhotos: (state, action: PayloadAction<Photo[]>) => {
      state.photos = action.payload;
    },
    addPhoto: (state, action: PayloadAction<Photo>) => {
      state.photos.push(action.payload);
    },
    updatePhoto: (state, action: PayloadAction<Photo>) => {
      const index = state.photos.findIndex(
        (photo) => photo.id === action.payload.id,
      );
      if (index !== -1) {
        state.photos[index] = action.payload;
      }
    },
    removePhoto: (state, action: PayloadAction<number>) => {
      state.photos = state.photos.filter(
        (photo) => photo.id !== action.payload,
      );
    },
    selectPhoto: (state, action: PayloadAction<Photo | undefined>) => {
      state.selectedPhoto = action.payload;
    },
  },
});

export const { setPhotos, addPhoto, updatePhoto, removePhoto, selectPhoto } =
  photosSlice.actions;
export default photosSlice.reducer;
