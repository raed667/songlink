const navigation = [
  {
    name: "Mastodon",
    href: "https://mastodon.online/@raed",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          imageRendering="optimizeQuality"
          fillRule="evenodd"
          clipRule="evenodd"
          viewBox="0 0 480 511.476"
        >
          <defs>
            <linearGradient
              id="prefix__a"
              gradientUnits="userSpaceOnUse"
              x1="235.378"
              y1=".003"
              x2="235.378"
              y2="506.951"
            >
              <stop offset="0" stopColor="#6364FF" />
              <stop offset="1" stopColor="#563ACC" />
            </linearGradient>
          </defs>
          <g fillRule="nonzero">
            <path
              fill="currentColor"
              d="M478.064 113.237c-7.393-54.954-55.29-98.266-112.071-106.656C356.413 5.163 320.121 0 236.045 0h-.628c-84.1 0-102.141 5.163-111.72 6.581C68.498 14.739 18.088 53.655 5.859 109.261c-5.883 27.385-6.51 57.747-5.416 85.596 1.555 39.939 1.859 79.806 5.487 119.581a562.694 562.694 0 0013.089 78.437c11.625 47.654 58.687 87.313 104.793 103.494a281.073 281.073 0 00153.316 8.09 224.345 224.345 0 0016.577-4.533c12.369-3.928 26.856-8.321 37.506-16.042.146-.107.265-.247.348-.407.086-.161.134-.339.14-.521v-38.543a1.187 1.187 0 00-.119-.491 1.122 1.122 0 00-.773-.604 1.139 1.139 0 00-.503 0 424.932 424.932 0 01-99.491 11.626c-57.664 0-73.171-27.361-77.611-38.752a120.09 120.09 0 01-6.745-30.546 1.123 1.123 0 01.877-1.152c.173-.035.349-.032.518.012a416.876 416.876 0 0097.864 11.623c7.929 0 15.834 0 23.763-.211 33.155-.928 68.103-2.626 100.722-8.997.815-.16 1.63-.3 2.326-.508 51.454-9.883 100.422-40.894 105.397-119.42.185-3.093.651-32.385.651-35.591.022-10.903 3.51-77.343-.511-118.165z"
            />
            <path
              fill="#fff"
              d="M396.545 174.981v136.53h-54.104V179.002c0-27.896-11.625-42.124-35.272-42.124-25.996 0-39.017 16.833-39.017 50.074v72.531h-53.777v-72.531c0-33.241-13.044-50.074-39.04-50.074-23.507 0-35.248 14.228-35.248 42.124v132.509H86.006v-136.53c0-27.896 7.123-50.059 21.366-66.488 14.695-16.387 33.97-24.803 57.896-24.803 27.691 0 48.617 10.647 62.568 31.917l13.464 22.597 13.484-22.597c13.951-21.27 34.877-31.917 62.521-31.917 23.902 0 43.177 8.416 57.919 24.803 14.231 16.414 21.336 38.577 21.321 66.488z"
            />
          </g>
        </svg>
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/raed667",
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="fixed bottom-0 border-t bg-white border-gray-200 shadow w-full">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:flex sm:items-center sm:justify-between md:px-8">
        <div className="justify-center space-x-6 sm:order-2 hidden sm:flex">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="mt-1 sm:order-1 md:mt-0">
          <p className="text-center text-sm leading-5 text-gray-500">
            &copy; 2024 Raed Chammam
          </p>
        </div>
      </div>
    </footer>
  );
}