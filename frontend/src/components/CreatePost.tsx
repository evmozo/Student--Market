import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { Post, PostCategory, PostCondition, PostType } from "../types";
import { api, apiData, uploadFiles } from "../utils/api";
import { categories, conditions } from "../utils/constants";

interface CreatePostForm {
  title: string;
  description: string;
  price: number;
  category: PostCategory;
  type: PostType;
  condition: PostCondition;
  location: string;
}

export const CreatePost = ({ onCreated, variant = "fab" }: { onCreated: (post: Post) => void; variant?: "fab" | "inline" }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  const { register, handleSubmit, trigger, reset, formState } = useForm<CreatePostForm>({
    defaultValues: {
      category: "books",
      type: "sell",
      condition: "used-good"
    }
  });

  const addFiles = (incoming: FileList | File[]) => {
    const next = [...files, ...Array.from(incoming).filter((file) => file.type.startsWith("image/"))].slice(0, 5);
    setFiles(next);
  };

  const nextStep = async () => {
    const ok = step === 1 ? await trigger(["title", "description", "price"]) : true;
    if (ok) setStep((value) => Math.min(3, value + 1));
  };

  const onSubmit = async (values: CreatePostForm) => {
    setSubmitting(true);
    setProgress(20);
    try {
      const images = files.length ? await uploadFiles(files, "posts") : [];
      setProgress(70);
      const data = await apiData<{ post: Post }>(api.post("/posts", { ...values, price: Number(values.price), images }));
      onCreated(data.post);
      toast.success("Post created.");
      reset();
      setFiles([]);
      setStep(1);
      setOpen(false);
      setProgress(100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create post");
    } finally {
      setSubmitting(false);
      window.setTimeout(() => setProgress(0), 500);
    }
  };

  return (
    <>
      {variant === "inline" ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(true)}
          className="flex min-h-12 w-full items-center gap-3 rounded-full bg-slate-100 px-4 text-left font-semibold text-slate-500 transition hover:bg-blue-50 hover:text-blue-700"
        >
          <Plus className="h-5 w-5 text-blue-600" />
          What are you buying or selling today?
        </motion.button>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Create Post
        </motion.button>
      )}
      <AnimatePresence>
        {open ? (
          <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-lg font-bold">Create marketplace post</p>
                  <p className="text-sm text-slate-500">Step {step} of 3</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 p-5">
                {step === 1 ? (
                  <>
                    <label className="block text-sm font-semibold">
                      Title
                      <input {...register("title", { required: true, maxLength: 100 })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-500" />
                    </label>
                    <label className="block text-sm font-semibold">
                      Description
                      <textarea {...register("description", { required: true, maxLength: 2000 })} rows={5} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-500" />
                    </label>
                    <label className="block text-sm font-semibold">
                      Price
                      <input type="number" min={0} {...register("price", { required: true, min: 0, valueAsNumber: true })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 outline-none focus:border-blue-500" />
                    </label>
                  </>
                ) : null}
                {step === 2 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold">
                      Category
                      <select {...register("category")} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
                        {categories.filter((item) => item.value !== "all").map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">
                      Type
                      <select {...register("type")} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
                        <option value="sell">Sell</option>
                        <option value="buy">Buy</option>
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">
                      Condition
                      <select {...register("condition")} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2">
                        {conditions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                    <label className="block text-sm font-semibold">
                      Location
                      <input {...register("location", { required: true, maxLength: 120 })} className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2" />
                    </label>
                  </div>
                ) : null}
                {step === 3 ? (
                  <div
                    onDrop={(event) => {
                      event.preventDefault();
                      addFiles(event.dataTransfer.files);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    className="rounded-lg border border-dashed border-slate-300 p-4"
                  >
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md bg-slate-50 p-8 text-center hover:bg-slate-100">
                      <ImagePlus className="h-8 w-8 text-slate-500" />
                      <span className="font-semibold">Drop images or choose up to 5</span>
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addFiles(event.target.files ?? [])} />
                    </label>
                    {previews.length ? (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {previews.map((preview, index) => (
                          <div key={preview.url} className="relative">
                            <img src={preview.url} alt={preview.file.name} className="aspect-square rounded-md object-cover" />
                            <button
                              type="button"
                              onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                              className="absolute right-1 top-1 rounded-full bg-white p-1 shadow"
                              aria-label="Remove image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {submitting ? <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} /></div> : null}
                  </div>
                ) : null}
                {Object.keys(formState.errors).length ? <p className="text-sm font-medium text-red-600">Please complete the required fields.</p> : null}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
                <button type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} className="rounded-md border border-slate-200 px-4 py-2 font-semibold text-slate-700 disabled:opacity-50" disabled={step === 1}>
                  Back
                </button>
                {step < 3 ? (
                  <button type="button" onClick={nextStep} className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white">Next</button>
                ) : (
                  <button type="submit" disabled={submitting} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
                    {submitting ? "Publishing..." : "Publish"}
                  </button>
                )}
              </div>
            </motion.form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};
