from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from unfold.contrib.import_export.forms import ExportForm, ImportForm
from .models import Region, Ville


# Resources 

class RegionResource(resources.ModelResource):
    class Meta:
        model = Region
        fields = ("id", "nom")
class VilleResource(resources.ModelResource):
    class Meta:
        model = Ville
        fields = ("id", "nom", "pays", "region")

# ModelAdmin 
@admin.register(Region)
class RegionAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_class = RegionResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ("id", "nom")
    search_fields = ("nom",)


@admin.register(Ville)
class VilleAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_class = VilleResource
    import_form_class = ImportForm
    export_form_class = ExportForm
    list_display = ("id", "nom", "pays", "region")
    search_fields = ("nom", "pays")