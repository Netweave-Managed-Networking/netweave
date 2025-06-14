import SectionScrollerComponent from './section-scroller-component';

export default function ExamplePage() {
  return (
    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
      <div className="border-b border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-bold">Example Page</h1>
        <SectionScrollerComponent />
      </div>
    </div>
  );
}
