"use client";

// Define the shape of the home object
type HomeAttributes = {
  id: number;
  name: string;
  address: string;
  price: string;
  image: string;
};

type HomeProps = {
  home: HomeAttributes; 
  togglePop: (home: HomeAttributes) => void;
};

const Home = ({ home, togglePop }: HomeProps) => {
  return (
    <div 
        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition cursor-pointer border border-gray-200"
        onClick={() => togglePop(home)}
    >
      <div className="h-64 overflow-hidden bg-gray-200 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={home.image} alt="Home" className="w-full h-full object-cover" />
      </div>
      
      <div className="p-6">
          <div className="flex justify-between items-center mb-2">
             <h3 className="text-xl font-bold text-gray-900">{home.name}</h3>
             <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg font-bold">{home.price} ETH</span>
          </div>
          <p className="text-gray-600">{home.address}</p>
      </div>
    </div>
  );
}

export default Home;
