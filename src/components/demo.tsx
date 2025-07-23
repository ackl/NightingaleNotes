import { Button } from './Button';

function ButtonDemo() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          NightingaleNotes Button Component
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Default Variants</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Sizes</h2>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="on">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">States</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">With Icons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Note
              </Button>
              <Button variant="outline">
                Save
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Full Width</h2>
            <Button className="w-full" size="lg">
              Create New Note
            </Button>
          </section>
        </div >
      </div >
    </div >
  );
}

export default ButtonDemo;
