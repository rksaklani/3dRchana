import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              View 3D models in your browser
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-primary-100">
              Upload meshes, point clouds, and Gaussian splats. Create projects, process assets, and stream interactive 3D with Unreal Engine—no install required.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center rounded-xl bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-lg hover:bg-primary-50 transition-colors"
              >
                Get started
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-xl border-2 border-white/50 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center">How it works</h2>
          <p className="mt-4 text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Create a project, upload your 3D files, and view them in real time in the browser.
          </p>
          <div className="mt-16 grid sm:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Create a project', desc: 'Sign up and create a project in your dashboard.' },
              { step: '2', title: 'Upload models', desc: 'Upload meshes (OBJ, FBX), point clouds, or Gaussian splat data.' },
              { step: '3', title: 'View in browser', desc: 'Open the 3D viewer and interact with your scene in real time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-lg flex items-center justify-center mx-auto">
                  {step}
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="mt-4 text-lg text-gray-600">Create an account and upload your first 3D model.</p>
          <Link
            to="/signup"
            className="mt-8 inline-flex items-center rounded-xl bg-primary-600 px-6 py-3 text-base font-semibold text-white hover:bg-primary-700 transition-colors"
          >
            Sign up free
          </Link>
        </div>
      </section>
    </div>
  );
}
