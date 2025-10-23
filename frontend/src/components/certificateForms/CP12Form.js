import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Trash2 } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';

const CP12Form = ({ formData, setFormData, currentAppliance, setCurrentAppliance, addAppliance, removeAppliance }) => {
  return (
    <>
      {/* General Installation Checks */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">General Installation Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="tightness_test"
              checked={formData.let_by_tightness_test}
              onCheckedChange={(checked) => setFormData({ ...formData, let_by_tightness_test: checked })}
            />
            <Label htmlFor="tightness_test" className="cursor-pointer">Let by and tightness test ok?</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="bonding"
              checked={formData.equipotential_bonding}
              onCheckedChange={(checked) => setFormData({ ...formData, equipotential_bonding: checked })}
            />
            <Label htmlFor="bonding" className="cursor-pointer">Main equipotential bonding ok?</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="ecv"
              checked={formData.ecv_accessible}
              onCheckedChange={(checked) => setFormData({ ...formData, ecv_accessible: checked })}
            />
            <Label htmlFor="ecv" className="cursor-pointer">ECV accessible?</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="pipework"
              checked={formData.pipework_visual_inspection}
              onCheckedChange={(checked) => setFormData({ ...formData, pipework_visual_inspection: checked })}
            />
            <Label htmlFor="pipework" className="cursor-pointer">Satisfactory visual inspection of gas installation pipework?</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="co_alarm"
              checked={formData.co_alarm_working}
              onCheckedChange={(checked) => setFormData({ ...formData, co_alarm_working: checked })}
            />
            <Label htmlFor="co_alarm" className="cursor-pointer">CO alarm fitted and working?</Label>
          </div>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="smoke_alarm"
              checked={formData.smoke_alarm_working}
              onCheckedChange={(checked) => setFormData({ ...formData, smoke_alarm_working: checked })}
            />
            <Label htmlFor="smoke_alarm" className="cursor-pointer">Smoke alarm fitted and working?</Label>
          </div>
        </CardContent>
      </Card>

      {/* Appliances Section - Same as before */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Appliances Inspected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Appliance Form - Same as original */}
          <div className="border rounded-lg p-4 space-y-3 bg-slate-50">
            <h4 className="font-semibold text-sm">Add New Appliance</h4>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Type (e.g., Boiler, Cooker)"
                value={currentAppliance.appliance_type}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, appliance_type: e.target.value })}
              />
              <Input
                placeholder="Make and Model"
                value={currentAppliance.make_model}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, make_model: e.target.value })}
              />
              <Input
                placeholder="Room/Location"
                value={currentAppliance.installation_area}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, installation_area: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="to_inspect"
                  checked={currentAppliance.to_be_inspected}
                  onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, to_be_inspected: checked })}
                />
                <Label htmlFor="to_inspect" className="text-sm cursor-pointer">To be inspected</Label>
              </div>
              <ErrorBoundary>
                <Select value={currentAppliance.flue_type} onValueChange={(value) => setCurrentAppliance({ ...currentAppliance, flue_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Flue Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Balanced">Balanced</SelectItem>
                    <SelectItem value="Fan assisted">Fan assisted</SelectItem>
                    <SelectItem value="Unflued">Unflued</SelectItem>
                  </SelectContent>
                </Select>
              </ErrorBoundary>
              <Input
                placeholder="Operating Pressure (mb/kWh)"
                value={currentAppliance.operating_pressure}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, operating_pressure: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safety_ok"
                  checked={currentAppliance.safety_devices_ok}
                  onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, safety_devices_ok: checked })}
                />
                <Label htmlFor="safety_ok" className="text-xs cursor-pointer">Safety devices OK</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vent_ok"
                  checked={currentAppliance.ventilation_satisfactory}
                  onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, ventilation_satisfactory: checked })}
                />
                <Label htmlFor="vent_ok" className="text-xs cursor-pointer">Ventilation OK</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flue_cond_ok"
                  checked={currentAppliance.flue_condition_satisfactory}
                  onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, flue_condition_satisfactory: checked })}
                />
                <Label htmlFor="flue_cond_ok" className="text-xs cursor-pointer">Flue condition OK</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flue_op_ok"
                  checked={currentAppliance.flue_operation_ok}
                  onCheckedChange={(checked) => setCurrentAppliance({ ...currentAppliance, flue_operation_ok: checked })}
                />
                <Label htmlFor="flue_op_ok" className="text-xs cursor-pointer">Flue operation OK</Label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="CO Reading (XX.XXXX)"
                value={currentAppliance.co_reading}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, co_reading: e.target.value })}
              />
              <Input
                placeholder="CO2 Reading (XX.XXXX)"
                value={currentAppliance.co2_reading}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, co2_reading: e.target.value })}
              />
              <Input
                placeholder="Fan Pressure (-XXX.X mb)"
                value={currentAppliance.fan_pressure_reading}
                onChange={(e) => setCurrentAppliance({ ...currentAppliance, fan_pressure_reading: e.target.value })}
              />
            </div>

            <Input
              placeholder="Defects (if any)"
              value={currentAppliance.defects}
              onChange={(e) => setCurrentAppliance({ ...currentAppliance, defects: e.target.value })}
            />

            <Button type="button" onClick={addAppliance} className="w-full bg-blue-600 hover:bg-blue-700">
              Add Appliance
            </Button>
          </div>

          {/* Appliances List */}
          {formData.appliances && formData.appliances.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Added Appliances ({formData.appliances.length})</h4>
              {formData.appliances.map((app, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border-2">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-semibold text-base">{app.appliance_type} - {app.make_model}</h5>
                      <p className="text-sm text-slate-600">Location: {app.installation_area || 'N/A'} | Flue: {app.flue_type}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeAppliance(index)}
                      className="hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <p>✓ Safety Devices: {app.safety_devices_ok ? 'Yes' : 'No'}</p>
                    <p>✓ Ventilation: {app.ventilation_satisfactory ? 'Yes' : 'No'}</p>
                    <p>✓ Flue Condition: {app.flue_condition_satisfactory ? 'Yes' : 'No'}</p>
                    <p>✓ Flue Operation: {app.flue_operation_ok ? 'Yes' : 'No'}</p>
                    {app.co_reading && <p>CO: {app.co_reading}</p>}
                    {app.co2_reading && <p>CO2: {app.co2_reading}</p>}
                    {app.fan_pressure_reading && <p>Fan Pressure: {app.fan_pressure_reading}</p>}
                  </div>
                  {app.defects && <p className="text-sm text-red-600 mt-2">Defects: {app.defects}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Statement */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Compliance Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.compliance_statement || ''}
            onChange={(e) => setFormData({ ...formData, compliance_statement: e.target.value })}
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter compliance statement (e.g., 'All gas appliances have been inspected and found to be safe for continued use...')"
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CP12Form;
