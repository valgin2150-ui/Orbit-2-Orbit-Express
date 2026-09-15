import { Card } from "@/components/ui/card";

export default function FeatureImages() {
  const features = [
    {
      title: "Orbit Selection Guide",
      description: "Understanding the right orbit for your mission",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "Satellite orbiting Earth"
    },
    {
      title: "Launch Provider Guide",
      description: "Selecting the right partner for your space mission",
      image: "https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "Mission control center"
    },
    {
      title: "Payload Optimization",
      description: "Techniques to reduce costs and improve reliability",
      image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
      alt: "Rocket launch at night"
    }
  ];

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((feature, index) => (
        <Card 
          key={index}
          className="rounded-lg overflow-hidden group relative p-0 border-none bg-transparent"
        >
          <img
            src={feature.image}
            alt={feature.alt}
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium">{feature.title}</h3>
            <p className="text-sm text-gray-300">{feature.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
