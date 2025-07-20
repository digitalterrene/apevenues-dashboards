"use client";
// components/admin/KeyBundleManager.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
//
interface KeyBundle {
  id: string;
  name: string;
  description: string;
  keyCount: number;
  price: number;
  createdAt: string;
}

export const KeyBundleManager = () => {
  const [bundles, setBundles] = useState<KeyBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    keyCount: 50,
    price: 120,
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/key-bundles");
      const data = await response.json();
      if (data.success) {
        setBundles(data.bundles);
      }
    } catch (error) {
      toast.error("Failed to fetch bundles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.keyCount || !formData.price) {
      toast.error("Name, key count and price are required");
      return;
    }

    setLoading(true);
    try {
      const url = editingId
        ? `/api/admin/key-bundles?id=${editingId}`
        : "/api/admin/key-bundles";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? formData : { ...formData, id: editingId }
        ),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(
          editingId
            ? "Bundle updated successfully"
            : "Bundle created successfully"
        );
        setEditingId(null);
        setFormData({
          name: "",
          description: "",
          keyCount: 50,
          price: 120,
        });
        fetchBundles();
      } else {
        toast.error(data.error || "Operation failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (bundle: KeyBundle) => {
    setEditingId(bundle.id);
    setFormData({
      name: bundle.name,
      description: bundle.description,
      keyCount: bundle.keyCount,
      price: bundle.price,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;

    setLoading(true);
    try {
      const response = await fetch("/api/admin/key-bundles", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Bundle deleted successfully");
        fetchBundles();
      } else {
        toast.error(data.error || "Deletion failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? "Edit Bundle" : "Create New Bundle"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name*</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Basic Plan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="50 keys for R120"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Key Count*</label>
            <Input
              type="number"
              value={formData.keyCount}
              onChange={(e) =>
                setFormData({ ...formData, keyCount: Number(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (R)*</label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
            />
          </div>
        </div>
        <div className="flex justify-end mt-4 space-x-2">
          {editingId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  description: "",
                  keyCount: 50,
                  price: 120,
                });
              }}
            >
              Cancel
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Processing..."
              : editingId
              ? "Update Bundle"
              : "Create Bundle"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Keys</TableHead>
              <TableHead>Price (R)</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell className="font-medium">{bundle.name}</TableCell>
                <TableCell>{bundle.description}</TableCell>
                <TableCell>{bundle.keyCount}</TableCell>
                <TableCell>{bundle.price.toFixed(2)}</TableCell>
                <TableCell>
                  {new Date(bundle.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="space-x-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(bundle)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(bundle.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
