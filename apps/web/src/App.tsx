import { VideoPreview } from './components/VideoPreview';
import { MediaControls } from './components/MediaControls';
import { DeviceSelect } from './components/DeviceSelect';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">视频通话</h1>
        <DeviceSelect />
        <div className="aspect-video">
          <VideoPreview className="w-full h-full object-cover" />
        </div>
        <MediaControls />
      </div>
    </div>
  );
}

export default App;
