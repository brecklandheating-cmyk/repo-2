import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, Flame, Wrench, Droplets, ShieldCheck, ArrowLeft } from 'lucide-react';

const CertificateSelection = () => {
  const navigate = useNavigate();

  const certificateTypes = [
    {
      type: 'CP12',
      title: 'CP12 Gas Safety Certificate',
      description: 'Landlord Gas Safety Record - Annual gas appliance checks',
      icon: ShieldCheck,
      color: 'blue',
      route: '/certificates/new/cp12'
    },
    {
      type: 'BENCHMARK',
      title: 'Benchmark Commissioning',
      description: 'Gas Boiler Installation Commissioning Checklist',
      icon: FileCheck,
      color: 'emerald',
      route: '/certificates/new/benchmark'
    },
    {
      type: 'CD11',
      title: 'CD11 Oil Boiler Service',
      description: 'OFTEC Oil Firing Servicing & Commissioning Report',
      icon: Flame,
      color: 'orange',
      route: '/certificates/new/cd11'
    },
    {
      type: 'CD10',
      title: 'CD10 Oil Installation',
      description: 'OFTEC Oil Firing Installation Completion Report',
      icon: Wrench,
      color: 'green',
      route: '/certificates/new/cd10'
    },
    {
      type: 'TI133D',
      title: 'TI/133D Tank Risk Assessment',
      description: 'OFTEC Oil Storage Tank Spillage & Fire Risk Assessment',
      icon: Droplets,
      color: 'purple',
      route: '/certificates/new/ti133d'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/certificates')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Select Certificate Type
          </h1>
          <p className="text-lg text-slate-600">
            Choose the type of certificate you want to create
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificateTypes.map((cert) => {
            const Icon = cert.icon;
            return (
              <Card
                key={cert.type}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-400"
                onClick={() => navigate(cert.route)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-xl bg-${cert.color}-100 flex items-center justify-center mb-4`}>
                    <Icon className={`w-7 h-7 text-${cert.color}-600`} />
                  </div>
                  <CardTitle className="text-2xl">{cert.title}</CardTitle>
                  <CardDescription className="text-base pt-2">
                    {cert.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCertificateSelect(cert.route, cert.type);
                    }}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Create {cert.type}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg border">
          <h3 className="font-semibold text-lg mb-2">Certificate Information</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong>CP12:</strong> Required annually for landlords with gas appliances</li>
            <li><strong>Benchmark:</strong> Gas boiler commissioning checklist for new installations</li>
            <li><strong>CD11:</strong> Oil boiler service certificate with combustion analysis</li>
            <li><strong>CD10:</strong> Installation certificate for new oil heating systems</li>
            <li><strong>TI/133D:</strong> Risk assessment for domestic oil storage tanks</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CertificateSelection;
