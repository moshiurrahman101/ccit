export function Stats() {
  const stats = [
    {
      number: '1000+',
      label: 'সফল শিক্ষার্থী',
      description: 'আমাদের কোর্স থেকে পাস করে চাকরি পেয়েছেন'
    },
    {
      number: '50+',
      label: 'প্রফেশনাল কোর্স',
      description: 'বিভিন্ন টেকনোলজিতে বিশেষজ্ঞ কোর্স'
    },
    {
      number: '25+',
      label: 'বিশেষজ্ঞ মেন্টর',
      description: 'ইন্ডাস্ট্রি এক্সপার্টদের কাছ থেকে শিখুন'
    },
    {
      number: '95%',
      label: 'সন্তুষ্টি হার',
      description: 'শিক্ষার্থীদের সুপারিশের ভিত্তিতে'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            আমাদের সাফল্যের সংখ্যা
          </h2>
          <p className="text-xl text-gray-600">
            গত ৩ বছরে আমরা যা অর্জন করেছি
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className={`text-4xl font-bold mb-2 ${index % 2 === 0 ? 'text-orange-500' : 'text-blue-500'}`}>
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <div className="text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
