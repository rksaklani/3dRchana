export default function About() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-4xl font-bold text-gray-900">About UE 3D Viewer</h1>
        <div className="mt-8 prose prose-lg text-gray-600 max-w-none">
          <p>
            UE 3D Viewer lets you upload 3D models—meshes, point clouds, and Gaussian splats—and view them in the browser using Unreal Engine Pixel Streaming. Create projects, process assets, and share interactive 3D experiences without requiring your audience to install anything.
          </p>
          <h2 className="text-2xl font-semibold text-gray-900 mt-10">How it works</h2>
          <ol className="list-decimal list-inside space-y-2 mt-4">
            <li>Sign up and create a project in the dashboard.</li>
            <li>Upload your 3D files (OBJ, FBX, PLY, point clouds, etc.).</li>
            <li>We process and optimize assets for streaming.</li>
            <li>Open the viewer in your browser and interact with your scene in real time.</li>
          </ol>
          <h2 className="text-2xl font-semibold text-gray-900 mt-10">Technology</h2>
          <p className="mt-4">
            The viewer is powered by Unreal Engine and Pixel Streaming infrastructure, so you get high-quality rendering and low latency. The web frontend connects to your streaming session so you can orbit, zoom, and inspect your models from any device.
          </p>
        </div>
      </div>
    </div>
  );
}
