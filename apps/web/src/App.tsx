import { Room } from './components/Room';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">视频通话</h1>
        <Room />
      </div>
    </div>
  );
}

export default App;
