
import React from 'react';
import { Button } from "@/components/ui/button";
import { Book, Navigation, BookText, Scroll } from "lucide-react";

const QuranQibla = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">Islamic Resources</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quran Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Book className="text-emerald-600" />
              Quran Resources
            </h2>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-gray-600 mb-4">
                  Read the Holy Quran online
                </p>
                <Button
                  onClick={() => window.open('https://quran.com', '_blank')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Open Quran.com
                </Button>
              </div>
              <div>
                <p className="text-gray-600 mb-4">
                  Learn how to properly recite with Niyyah App
                </p>
                <div className="space-x-2">
                  <Button
                    onClick={() => window.open('https://apps.apple.com/us/app/niyyah-quran-learning-app/id1570935695', '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    iOS App
                  </Button>
                  <Button
                    onClick={() => window.open('https://play.google.com/store/apps/details?id=com.niyyah.app', '_blank')}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Android App
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Qibla Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Navigation className="text-emerald-600" />
              Qibla Direction
            </h2>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Find accurate Qibla direction using Qibla Finder
              </p>
              <Button
                onClick={() => window.open('https://qiblafinder.withgoogle.com', '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Find Qibla Direction
              </Button>
            </div>
          </div>

          {/* Hadith Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <BookText className="text-emerald-600" />
              Hadith Collection
            </h2>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Access authentic Hadith collections on Sunnah.com
              </p>
              <Button
                onClick={() => window.open('https://sunnah.com', '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Read Hadith
              </Button>
            </div>
          </div>

          {/* Duas Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Scroll className="text-emerald-600" />
              Duas Collection
            </h2>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Find authentic Duas for various occasions
              </p>
              <Button
                onClick={() => window.open('https://lifewithallah.com/dhikr-dua/', '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Browse Duas
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranQibla;
