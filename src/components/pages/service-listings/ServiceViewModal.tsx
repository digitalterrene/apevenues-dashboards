import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Send, X, Clock, MapPin, Calendar } from "lucide-react";
import React from "react";

export default function ServiceViewModal({
  isViewModalOpen,
  setIsViewModalOpen,
  selectedService,
  getLocationText,
  openRequestModal,
}: any) {
  return (
    <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <div className="relative">
          {selectedService?.images && selectedService.images.length > 0 && (
            <div className="h-64 w-full relative">
              <img
                src={selectedService.images[0]}
                alt={selectedService.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white bg-opacity-20 text-white hover:bg-white hover:bg-opacity-30 rounded-full"
                onClick={() => setIsViewModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="p-6">
            <DialogHeader className="text-left pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <DialogTitle className="text-2xl">
                    {selectedService?.name}
                  </DialogTitle>
                  <DialogDescription className="text-base mt-1">
                    {selectedService?.category}
                  </DialogDescription>
                </div>
                <div className="bg-[#6BADA0] text-white px-3 py-1 rounded-full text-sm">
                  R{selectedService?.price}
                </div>
              </div>
            </DialogHeader>

            {selectedService && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Description</h4>
                  <p className="text-gray-700">{selectedService.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-[#6BADA0]" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-gray-600">
                          {selectedService.duration}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-[#6BADA0]" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-gray-600">
                          {getLocationText(selectedService)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedService.createdAt && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-[#6BADA0]" />
                      <div>
                        <p className="font-medium">Listed On</p>
                        <p className="text-gray-600">
                          {new Date(
                            selectedService.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      openRequestModal(selectedService);
                    }}
                    className="bg-[#6BADA0] hover:bg-[#5a9c8f]"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Request This Service
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
