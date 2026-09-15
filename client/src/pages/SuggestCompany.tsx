import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Building2, Globe, MapPin, Briefcase, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSEO } from "@/hooks/useSEO";
import { 
  SEGMENT_TYPES, 
  SEGMENT_LABELS, 
  COMPANY_TYPES, 
  COMPANY_TYPE_LABELS,
  insertCompanySuggestionSchema
} from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  country: z.string().min(2, "Country is required"),
  headquartersCity: z.string().min(2, "Headquarters city is required"),
  foundedYear: z.string().optional(),
  segments: z.array(z.string()).min(1, "Select at least one segment"),
  companyType: z.string(),
  website: z.string().url("Please enter a valid website URL"),
  linkedin: z.string().optional(),
  description: z.string().min(20, "Please provide a brief description (20+ characters)"),
  activeProducts: z.string().optional(),
  submitterEmail: z.string().email("Please enter a valid email"),
  submitterName: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const COUNTRIES = [
  "United States", "China", "Russia", "India", "Japan", "France", "Germany", 
  "United Kingdom", "Italy", "Canada", "South Korea", "Israel", "Australia",
  "New Zealand", "Brazil", "Mexico", "Spain", "Netherlands", "Luxembourg",
  "Ukraine", "Poland", "Singapore", "United Arab Emirates", "Saudi Arabia", "Other"
];

export default function SuggestCompany() {
  useSEO({
    title: "Suggest a Space Company - Add to Our Directory",
    description: "Know a space company missing from our directory? Submit it here and help us build the most comprehensive space industry database.",
    canonical: "/suggest-company",
    keywords: "submit space company, space industry directory submission, add aerospace company, space company database",
  });
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      country: "",
      headquartersCity: "",
      foundedYear: "",
      segments: [],
      companyType: "commercial_private",
      website: "",
      linkedin: "",
      description: "",
      activeProducts: "",
      submitterEmail: "",
      submitterName: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        foundedYear: data.foundedYear ? parseInt(data.foundedYear) : null
      };
      const response = await apiRequest("POST", "/api/company-suggestions", payload);
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Suggestion Submitted!",
        description: "Thank you for contributing to our directory. We'll review your suggestion soon."
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your suggestion. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-800 text-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="bg-slate-800/50 border-slate-700 text-center">
            <CardContent className="pt-12 pb-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-3xl font-display font-bold text-white mb-4">
                Thank You!
              </h1>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Your company suggestion has been submitted successfully. Our team will review it and add it to the directory if it meets our criteria.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/directory">
                  <Button className="bg-teal-400 hover:bg-teal-500 text-black" data-testid="button-back-directory">
                    Back to Directory
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-gray-300"
                  onClick={() => {
                    setSubmitted(false);
                    form.reset();
                  }}
                  data-testid="button-suggest-another"
                >
                  Suggest Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-8">
        <div className="flex items-center mb-8">
          <Link href="/directory" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[44px]" data-testid="link-back">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Directory</span>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
            Suggest a Company
          </h1>
          <p className="text-gray-400 text-lg">
            Know a space company, organization, or agency that should be in our directory? 
            Fill out this form and we'll review it for inclusion.
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-400" />
              Company Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please provide as much detail as possible about the company.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Company Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Rocket Lab" 
                            className="bg-gray-800 border-gray-400 text-white"
                            data-testid="input-name"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Website *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com" 
                            className="bg-gray-800 border-gray-400 text-white"
                            data-testid="input-website"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Country *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-400 text-white" data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            {COUNTRIES.map(country => (
                              <SelectItem key={country} value={country} className="text-white hover:bg-slate-700">
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="headquartersCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Headquarters City *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Long Beach" 
                            className="bg-gray-800 border-gray-400 text-white"
                            data-testid="input-city"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">Founded Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 2006" 
                            className="bg-gray-800 border-gray-400 text-white"
                            data-testid="input-founded"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="companyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Company Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-400 text-white" data-testid="select-type">
                            <SelectValue placeholder="Select company type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {COMPANY_TYPES.map(type => (
                            <SelectItem key={type} value={type} className="text-white hover:bg-slate-700">
                              {COMPANY_TYPE_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="segments"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Industry Segments * (select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {SEGMENT_TYPES.map(segment => (
                          <FormField
                            key={segment}
                            control={form.control}
                            name="segments"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(segment)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      if (checked) {
                                        field.onChange([...current, segment]);
                                      } else {
                                        field.onChange(current.filter((s: string) => s !== segment));
                                      }
                                    }}
                                    className="border-slate-500 data-[state=checked]:bg-blue-600"
                                    data-testid={`checkbox-segment-${segment}`}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm text-gray-300 font-normal cursor-pointer">
                                  {SEGMENT_LABELS[segment]}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Company Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief description of what the company does, their mission, and key activities..."
                          className="bg-gray-800 border-gray-400 text-white min-h-[100px]"
                          data-testid="input-description"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Minimum 20 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activeProducts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">Active Products/Services</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Electron, Photon, Neutron (comma-separated)" 
                          className="bg-gray-800 border-gray-400 text-white"
                          data-testid="input-products"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        List key products or services, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-200">LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://linkedin.com/company/..." 
                          className="bg-gray-800 border-gray-400 text-white"
                          data-testid="input-linkedin"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Your Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="submitterName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Your Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Optional" 
                              className="bg-gray-800 border-gray-400 text-white"
                              data-testid="input-submitter-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="submitterEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">Your Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="your@email.com" 
                              className="bg-gray-800 border-gray-400 text-white"
                              data-testid="input-submitter-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            We'll notify you when your suggestion is reviewed
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                    disabled={mutation.isPending}
                    data-testid="button-submit"
                  >
                    {mutation.isPending ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Suggestion
                      </>
                    )}
                  </Button>
                  <Link href="/directory">
                    <Button variant="outline" className="border-slate-600 text-gray-300" data-testid="button-cancel">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
