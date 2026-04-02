export default function ImageGallery({ images }) {
  return (
    <div className="flex gap-2 overflow-x-auto mt-2">
      {images.map((img) => (
        <img
          key={img}
          src={`http://localhost:5000/uploads/${img}`}
          className="w-32 h-32 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
        />
      ))}
    </div>
  );
}